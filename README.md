# Smart City Events Map

A **city-wide interactive map** built with **Next.js** that displays:

* 🗓 **Events** happening around Tartu (fetched from a custom scraper & stored in Supabase)
* 🏥 **Services** such as hospitals, gyms, and restaurants *(coming soon)*
* 🚦 **Traffic data** *(planned)*
* ☁️ **Weather information** *(planned)*

The goal is to create a single platform where residents and visitors can easily explore **what’s happening in the city** and access useful local information.

---

## 📍 Current Features

✅ **Event Listings**

* A Python scraper (Selenium + BeautifulSoup) collects events from [kultuuriaken.tartu.ee](https://kultuuriaken.tartu.ee/en/events).
* Each event includes:

  * Title
  * Date & time
  * Location name
  * **Coordinates** (latitude & longitude)
  * **Category** (linked to a separate categories table)
* Data is stored and served via **Supabase** for seamless integration with the frontend.

✅ **Interactive Map (Next.js + Leaflet)**

* Events are displayed as clickable pins on a city map.
* Users can view event details directly on the map in real time.

---

## 🛠️ Tech Stack

### Frontend

* [Next.js](https://nextjs.org/) (React framework)
* [Leaflet](https://leafletjs.com/) for maps
* [Tailwind CSS](https://tailwindcss.com/) for styling
* [Supabase JS](https://supabase.com/docs/reference/javascript) client for fetching data

### Backend / Data

* [Supabase](https://supabase.com/) (PostgreSQL + Auth + API)
* Python scraper with **Selenium + BeautifulSoup** to update event data in Supabase

---

## 🚀 Database Schema (Supabase)

### `events` Table

| Column          | Type      | Description                             |
| --------------- | --------- | --------------------------------------- |
| `id`            | UUID (PK) | Unique event ID                         |
| `title`         | text      | Event title                             |
| `description`   | text      | Event description (optional)            |
| `start_date`    | timestamp | Event start date/time                   |
| `location_name` | text      | Name of the venue/location              |
| `latitude`      | float8    | Geographic latitude                     |
| `longitude`     | float8    | Geographic longitude                    |
| `category_id`   | uuid (FK) | Foreign key referencing `categories.id` |

### `categories` Table

| Column  | Type      | Description                                         |
| ------- | --------- | --------------------------------------------------- |
| `id`    | UUID (PK) | Unique category ID                                  |
| `name`  | text      | Human-readable category name (e.g., Music, Theatre) |
| `slug`  | text      | URL-friendly version of the name                    |
| `color` | text      | HEX or RGB color for map pins/UI badges             |
| `icon`  | text      | Icon name or URL for frontend display               |

This structure allows:

* **Consistent categories** across all events
* Easy filtering and custom styling based on `color` and `icon`

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Misha2007/smart-city-events-map.git
cd smart-city-events-map
```

### 2️⃣ Set up Supabase

1. Create a [Supabase](https://supabase.com/) project.
2. Create the `categories` table first, then `events` with a foreign key to `categories.id`.
3. Get your **API URL** and **anon/public key** from the Supabase dashboard.
4. Add them to a `.env.local` file in the Next.js project:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=your-redirect-URL
   ```

### 3️⃣ Install & run the Next.js app

```bash
npm install
npm run dev
```

The app will start at **[http://localhost:3000](http://localhost:3000)**

---

## ⚡ Scraper Setup (Optional but recommended)

The scraper updates Supabase with the latest event data.

**Requirements:**

* Python 3.8+
* Firefox + [GeckoDriver](https://github.com/mozilla/geckodriver/releases)

**Install dependencies:**

```bash
python3 -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

**Run the scraper:**

```bash
python getEvents.py
```

This will fetch the latest events and push them directly to your Supabase database, linking each event to its corresponding category.

---

## 💡 Roadmap

* [ ] Add **services** (hospitals, gyms, restaurants)
* [ ] Integrate **real-time traffic** API
* [ ] Add **weather data** with forecast overlays
* [ ] User accounts & favorites using Supabase Auth

---

## 📂 Suggested Project Structure

```
smart-city-events-map/
├─ .next/
├─ app/
├─ components/
├─ lib/
├─ node_modules/
├─ venv/
├─ env.local
├─ next-env.d.ts
├─ public/
├─ requirements.txt
├─ README.md
└─ ...
```

---

## 📜 License

MIT License – feel free to use and modify for your own projects.

---
