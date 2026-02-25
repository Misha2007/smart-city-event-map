from selenium import webdriver
from bs4 import BeautifulSoup
from time import sleep
import re
from supabase import create_client
from dotenv import load_dotenv
import os
from time import strptime
from selenium.webdriver.chrome.options import Options

# Load .env
load_dotenv(".env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"Supabase URL: {SUPABASE_URL}")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Scraping part
base_url = "https://kultuuriaken.tartu.ee"
url = base_url + "/en/events"

CATEGORY_META = {
    "utensils": {
        "icon": "Utensils",
        "color": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    },
    "drama": {
        "icon": "Drama",
        "color": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
    },
    "morehorizontal": {
        "icon": "MoreHorizontal",
        "color": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    },
    "school": {
        "icon": "School",
        "color": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    },
    "film": {
        "icon": "Film",
        "color": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
    },
    "image": {
        "icon": "Image",
        "color": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    },
    "bookopen": {
        "icon": "BookOpen",
        "color": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    },
    "football": {
        "icon": "Football",
        "color": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    },
    # Default fallback
    "other": {
        "icon": "MoreHorizontal",
        "color": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
}


def get_or_create_category(supabase, category_name):
    slug = category_name.lower().replace(" ", "-")

    meta = CATEGORY_META.get(slug, CATEGORY_META["other"])

    res = supabase.table("categories").select("id").eq("slug", slug).execute()
    if res.data and len(res.data) > 0:
        return res.data[0]["id"]

    new_category = {
        "name": category_name,
        "slug": slug,
        "icon": meta["icon"],
        "color": meta["color"],
    }
    insert_res = supabase.table("categories").insert(new_category).execute()
    if insert_res.data and len(insert_res.data) > 0:
        return insert_res.data[0]["id"]
    else:
        raise Exception("Failed to create category")

options = Options()
options.add_argument("--headless=new") 
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")


driver = webdriver.Chrome(options=options)
driver.get(url)
sleep(2)

response = driver.page_source
soup = BeautifulSoup(response, "html.parser")

for div in soup.find_all('div', class_='col'):
    link_tag = div.find('a')
    location_time = div.find_all('p')

    if link_tag and location_time:
        title = link_tag.get_text(strip=True)
        href = link_tag['href']
        full_url = href if href.startswith("http") else base_url + href

        # Visit individual event page to get coordinates and category
        driver.get(full_url)
        sleep(2)
        event_soup = BeautifulSoup(driver.page_source, "html.parser")

        # Coordinates
        scripts = event_soup.find_all("script")
        latitude = longitude = None
        for script in scripts:
            if "kultuuriaken" in script.text:
                match_lat = re.search(r'"latitude":([0-9\.\-]+)', script.text)
                match_lon = re.search(r'"longitude":([0-9\.\-]+)', script.text)
                if match_lat and match_lon:
                    latitude = float(match_lat.group(1))
                    longitude = float(match_lon.group(1))
                break

        # Category
        category = "Other"
        ul_tag = event_soup.find("ul", class_="tags")
        if ul_tag:
            li_tag = ul_tag.find("li")
            if li_tag:
                category = li_tag.get_text(strip=True)
                # print(category)

        # Other info
        description = f"Event: {title}"
        location_name = location_time[0].get_text(strip=True) if location_time else ""

        date_time_tag = event_soup.find("h3", class_="mb-4")
        event_date_start = None
        event_date_end = None
        event_time_start = None
        event_time_end = None
        month_abbreviations = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ]
        newList = []
        try:
            for i in date_time_tag.get_text(strip=True).split("-"):
                newList2 = []
                for x in i.split(" "):
                    if x:
                        if x in month_abbreviations or i.split(" ").index(x) == 0 or x.isnumeric() or ":" in x:
                            if ":" in x:
                                newList2.append(x[:5]) 
                            else:
                                if i.split(" ").index(x) == 0: 
                                    newList2.append(x[3:5]) 
                                else:
                                    newList2.append(x) 
                newList.append(newList2)  
        except Exception as e:
            print(f"Date parsing error for event '{title}': {e}")
            continue
       
        month_num = strptime(newList[0][1], '%b').tm_mon
        month_str = f"{month_num:02d}"  

        event_date_start = f"{month_str}-{newList[0][0]}-{newList[0][2]}"

        if len(newList[0]) > 3:
            event_time_start = newList[0][3]

        if len(newList) > 1:
            second_entry = newList[1]
            
            if len(second_entry) > 3:
                event_date_end = f"{month_str}-{second_entry[0]}-{second_entry[2]}"
                event_time_end = second_entry[3]
            else:
                event_time_end = second_entry[0]
        try:
            category_id = get_or_create_category(supabase, category)
        except Exception as e:
            print(f"Category handling error: {e}")
            category_id = None
        event_data = {
            "title": title,
            "description": description,
            "event_date_start": event_date_start,
            "event_time_start": event_time_start,
            "event_date_end": event_date_end,
            "event_time_end": event_time_end,
            "location_name": location_name,
            "category_id": category_id, 
            "latitude": latitude,
            "longitude": longitude
        }

        # Insert into Supabase (table name: events)
        try:
            result = supabase.table("events").select(
        """
    id,
    title,
    description,
    event_date_start,
    event_time_start,
    event_date_end,
    event_time_end,
    location_name,
    latitude,
    longitude,
    category:categories (
      id,
      name,
      slug,
      icon,
      color
      )
      """
    ).eq("title", title).execute()
            if len(result.data) == 0:
                inserted = supabase.table("events").insert(event_data).execute()
                print(f"Inserted: {title}")
        except Exception as e:
            print(f"Error inserting event '{title}': {e}")

driver.quit()
print("Scraping and insertion complete.")
