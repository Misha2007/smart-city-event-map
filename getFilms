from selenium import webdriver
from bs4 import BeautifulSoup
from time import sleep
import json

url = f'https://www.apollokino.ee/schedule?theatreAreaID=1015'


driver = webdriver.Firefox()

driver.get(url)
driver.find_element("xpath", '//*[@id="article-ajax-content-3062"]/div[1]/form/div/div[1]/div[2]/fieldset/div/div[2]').click()
sleep(5)
response = driver.page_source

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

driver.quit()

with open("data_films.json", "w", encoding="utf-8") as f:
    json.dump(films, f, ensure_ascii=False, indent=2)

print(f"Saved {len(films)} structured events to data.json.")