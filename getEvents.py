from selenium import webdriver
from bs4 import BeautifulSoup
from time import sleep
import json
import re

base_url = "https://kultuuriaken.tartu.ee"
url = base_url + "/en/events"

driver = webdriver.Firefox()
driver.get(url)
sleep(2)

response = driver.page_source
soup = BeautifulSoup(response, "html.parser")

events = []
event_id = 1

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

        # Category: first <li> inside <ul> with class tags
        category = "General"
        ul_tag = event_soup.find("ul", class_="tags")
        if ul_tag:
            li_tag = ul_tag.find("li")
            if li_tag:
                category = li_tag.get_text(strip=True)

        # Other info
        description = f"Event: {title}"
        start_date = "2025-09-12T00:00:00"  # placeholder
        location_name = location_time[0].get_text(strip=True) if location_time else ""

        event = {
            "id": str(event_id),
            "title": title,
            "description": description,
            "start_date": start_date,
            "location_name": location_name,
            "category": category,
            "latitude": latitude,
            "longitude": longitude
        }

        events.append(event)
        event_id += 1

driver.quit()

# Save to data.json
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(events, f, ensure_ascii=False, indent=2)

print(f"Saved {len(events)} structured events to data.json.")
