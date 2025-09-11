export interface EventFilters {
  category: string;
  search: string;
  dateRange: "all" | "today" | "week" | "month";
}
