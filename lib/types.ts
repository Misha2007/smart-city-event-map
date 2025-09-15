export interface EventFilters {
  category: string;
  search: string;
  dateRange: "all" | "today" | "week" | "month";
}

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color:
    | string
    | "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
};

export interface Event {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  location_name: string;
  latitude: number | 58.395385;
  longitude: number | 26.744548;
  start_date: string;
  end_date: string | null;
  image_url: string | null;
  website_url: string | null;
  contact_info: string | null;
  created_at: string;
  updated_at: string;
}
