from selenium import webdriver
from bs4 import BeautifulSoup
from time import sleep
import json
from supabase import create_client
from dotenv import load_dotenv
import os

url = f'https://www.apollokino.ee/schedule?theatreAreaID=1015'
load_dotenv(".env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"Supabase URL: {SUPABASE_URL}")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

driver = webdriver.Firefox()

driver.get(url)
driver.find_element("xpath", '//*[@id="article-ajax-content-3062"]/div[1]/form/div/div[1]/div[2]/fieldset/div/div[2]').click()
sleep(5)
response = driver.page_source

def insert_if_not_exists(table_name, match_dict, insert_dict):
    existing = supabase.table(table_name).select("*")
    for col, val in match_dict.items():
        existing = existing.eq(col, val)
    existing = existing.execute()
    
    if len(existing.data) == 0:
        supabase.table(table_name).insert(insert_dict).execute()
        print(f"Inserted into {table_name}: {insert_dict}")
    else:
        print(f"Already exists in {table_name}: {insert_dict}")

soup = BeautifulSoup(response)
films = []

for div in soup.find_all('div', class_='schedule-card__title-container'):
    genres = [i.get_text(strip=True) for i in div.find_all('span', class_='schedule-card__genre')]
    title = div.find('p').get_text(strip=True)  
    if not any(film['title'] == title for film in films):
        films.append({
            'title': title,
            'genres': genres,
            'languages': [],  
            'subtitles': [], 
            'formats': []
        })

for div in soup.find_all('div', class_='schedule-card__options'):
    language = None
    subtitles = None
    movie_format = None

    for option in div.find_all('div', class_='schedule-card__option'):
        label_tag = option.find('p', class_='schedule-card__option-label')

        if label_tag:
            label = label_tag.get_text(strip=True)
            
            if label == 'Keel':
                language = option.find('p', class_='schedule-card__option-title').get_text(strip=True)
            elif label == 'Subtiitrid':
                subtitles = option.find('p', class_='schedule-card__option-title').get_text(strip=True)
            elif label == 'Formaat':
                movie_format = option.find('p', class_='schedule-card__option-title').get_text(strip=True)

    parent_div = div.find_previous('div', class_='schedule-card__title-container')

    parent_title = parent_div.find('p', class_='schedule-card__title').get_text(strip=True)

    for film in films:
        if film['title'] == parent_title:
            if language and language not in film['languages']:
                film['languages'].append(language)
            if subtitles and subtitles not in film['subtitles']:
                film['subtitles'].append(subtitles)
            if movie_format and movie_format not in film['formats']:
                film['formats'].append(movie_format)
            
            try:
                result = supabase.table("movies").select("id").eq("title", film['title']).execute()
                
                if len(result.data) == 0:
                    inserted_movie = supabase.table("movies").insert({"title": film['title']}).execute()
                    movie_id = inserted_movie.data[0]['id']
                    print(f"Inserted movie: {film['title']}")
                else:
                    movie_id = result.data[0]['id']
                
                for genre in film['genres']:
                    res_genre = supabase.table("genres").select("id").eq("name", genre).execute()
                    if len(res_genre.data) == 0:
                        inserted_genre = supabase.table("genres").insert({"name": genre}).execute()
                        genre_id = inserted_genre.data[0]['id']
                    else:
                        genre_id = res_genre.data[0]['id']
                    
                    insert_if_not_exists(
                        "movie_genres",
                        {"movie_id": movie_id, "genre_id": genre_id},
                        {"movie_id": movie_id, "genre_id": genre_id}
                    )


                
                for lang in film['languages']:
                    res_lang = supabase.table("languages").select("id").eq("name", lang).execute()
                    if len(res_lang.data) == 0:
                        inserted_lang = supabase.table("languages").insert({"name": lang}).execute()
                        lang_id = inserted_lang.data[0]['id']
                    else:
                        lang_id = res_lang.data[0]['id']
                    insert_if_not_exists(
                        "movie_languages",
                        {"movie_id": movie_id, "language_id": lang_id},
                        {"movie_id": movie_id, "language_id": lang_id}
                    )

                
                for subtitle in film['subtitles']:
                    res_sub = supabase.table("subtitles").select("id").eq("name", subtitle).execute()
                    if len(res_sub.data) == 0:
                        inserted_sub = supabase.table("subtitles").insert({"name": subtitle}).execute()
                        sub_id = inserted_sub.data[0]['id']
                    else:
                        sub_id = res_sub.data[0]['id']
                    insert_if_not_exists(
                        "movie_subtitles",
                        {"movie_id": movie_id, "subtitle_id": sub_id},
                        {"movie_id": movie_id, "subtitle_id": sub_id}
                    )
                
                for fmt in film['formats']:
                    res_fmt = supabase.table("formats").select("id").eq("name", fmt).execute()
                    if len(res_fmt.data) == 0:
                        inserted_fmt = supabase.table("formats").insert({"name": fmt}).execute()
                        fmt_id = inserted_fmt.data[0]['id']
                    else:
                        fmt_id = res_fmt.data[0]['id']
                    insert_if_not_exists(
                        "movie_formats",
                        {"movie_id": movie_id, "format_id": fmt_id},
                        {"movie_id": movie_id, "format_id": fmt_id}
                    )
                    
            except Exception as e:
                print(f"Error inserting movie '{film['title']}': {e}")


driver.quit()



with open("data_films.json", "w", encoding="utf-8") as f:
    json.dump(films, f, ensure_ascii=False, indent=2)

print(f"Saved {len(films)} structured events to data.json.")