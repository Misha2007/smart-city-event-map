from selenium import webdriver
from bs4 import BeautifulSoup
from time import sleep
import json

url = "https://kultuuriaken.tartu.ee/en/events"

driver = webdriver.Firefox()
driver.get(url)
sleep(2)

response = driver.page_source
soup = BeautifulSoup(response, "html.parser")

events = []
event_id = 1

for div in soup.find_all('div', class_='col'):
    name = div.find('a')
    image_div = div.find('div', class_='image')
    location_time = div.find_all('p')

    if name and location_time:
        title = name.get_text(strip=True)

        # Description fallback (no real description exists in preview, so we'll use title or a default)
        description = f"Event: {title}"

        # Extract date/time (fallback to empty if missing)
        start_date_raw = location_time[1].get_text(strip=True) if len(location_time) > 1 else ""
        # Convert start_date to ISO format if possible — placeholder for now
        start_date = "2025-09-12T00:00:00"  # You can parse actual date here if available

        # Extract location
        location_name = location_time[0].get_text(strip=True) if location_time else ""

        # Dummy category for now (can parse from site if it exists)
        category = "General"

        event = {
            "id": str(event_id),
            "title": title,
            "description": description,
            "start_date": start_date,
            "location_name": location_name,
            "category": category
        }

        events.append(event)
        event_id += 1

driver.quit()

# Save to data.json
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(events, f, ensure_ascii=False, indent=2)

print(f"Saved {len(events)} structured events to data.json.")
