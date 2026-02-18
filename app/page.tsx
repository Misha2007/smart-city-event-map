"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Calendar,
  Search,
  Filter,
  Menu,
  X,
  Heart,
  HeartOff,
  Loader2,
} from "lucide-react";
import type { Event, Category, EventFilters } from "@/lib/types";
import AuthButton from "@/components/auth-button";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
// import { createClient } from "@/lib/supabase/client";
import MainMenu from "@/components/main-menu";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-muted-foreground">Loading map...</div>
    </div>
  ),
});

const dateRanges = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

function SmartCityEventsMapContent() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(true);
  const [filters, setFilters] = useState<EventFilters>({
    category: "all",
    search: "",
    dateRange: "all",
  });
  // const supabase = createClient();
  ``;

  // Static events array
  const [eventsData, setEventsData] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  const filteredEvents = eventsData.filter((event) => {
    const matchesCategory =
      filters.category === "all" || event.category?.slug === filters.category;

    const matchesSearch = event.title
      .toLowerCase()
      .includes(filters.search.toLowerCase());

    const eventDate = new Date(event.event_date_start);
    const now = new Date();

    let matchesDate = true;

    switch (filters.dateRange) {
      case "today":
        const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        matchesDate = eventDate >= startOfDay;
        break;

      case "week":
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = eventDate >= oneWeekAgo;
        break;

      case "month":
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = eventDate >= oneMonthAgo;
        break;
    }

    return matchesCategory && matchesSearch && matchesDate;
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.category !== "all")
        params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      if (filters.dateRange !== "all")
        params.append("dateRange", filters.dateRange);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/events/?${params.toString()}`
      );
      if (!response.ok) {
        console.log(response);

        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      setEventsData(data);
      console.log("sjdls");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [unAuthUser, setUnAuthUser] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}api/favorites`,
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          const { favorites } = await response.json();
          const ids = favorites.map((event) => event.id);
          setFavoriteIds(ids);
        }
        if (response.status === 401) {
          setUnAuthUser(true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const toggleFavorite = async (eventId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/favorites/toggle`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId }),
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to toggle favorite");

      // Update local state optimistically
      setFavoriteIds((prev) =>
        prev.includes(eventId)
          ? prev.filter((id) => id !== eventId)
          : [...prev, eventId]
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}api/categories`
        );
        if (!response.ok) throw new Error("Failed to fetch categories");
        console.log(response);
        const categories = await response.json();
        setCategories(categories);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Smart City Events Map...</span>
      </div>
    );
  }

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const safeTailwindClasses = [
    "bg-gray-100",
    "text-gray-800",
    "dark:bg-gray-900",
    "dark:text-gray-200",
    "bg-purple-100",
    "text-purple-800",
    "dark:bg-purple-900",
    "dark:text-purple-200",
    "bg-blue-100",
    "text-blue-800",
    "dark:bg-blue-900",
    "dark:text-blue-200",
    "bg-green-100",
    "text-green-800",
    "dark:bg-green-900",
    "dark:text-green-200",
    "bg-red-100",
    "text-red-800",
    "dark:bg-red-900",
    "dark:text-red-200",
  ];

  return (
    <div className="h-screen flex bg-background">
      {/* Hidden tailwind class reference block */}
      <div className="hidden">
        {safeTailwindClasses.map((cls) => (
          <div key={cls} className={cls} />
        ))}
      </div>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-96" : "w-0"
        } transition-all duration-300 overflow-hidden bg-card border-r border-border`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Tartu Events
              </h1>
              <p className="text-sm text-muted-foreground">
                Discover what's happening in the city
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AuthButton />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </h3>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Category
              </label>
              <Select
                value={filters.category}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="w-full muted-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Date Range
              </label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: value as EventFilters["dateRange"],
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Events List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">
                Events ({loading ? "..." : filteredEvents.length})
              </h3>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            {!loading && filteredEvents.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                No events found matching your criteria.
              </div>
            )}
            {filteredEvents.map((event) => {
              return (
                <Card
                  key={event.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedEvent?.id === event.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm text-foreground">
                      {event.title}
                    </h4>
                    {!unAuthUser && (
                      <Button
                        variant="like"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(event.id);
                        }}
                      >
                        {favoriteIds.includes(event.id) ? (
                          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        ) : (
                          <HeartOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    {event.event_date_start}
                    {event.event_date_end && (
                      <>{" - " + event.event_date_end}</>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {event.location_name}
                  </div>
                  <Badge
                    className={`text-xs ${
                      event.category.color ?? "bg-gray-200"
                    }`}
                  >
                    {event.category.name}
                  </Badge>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative">
        <div className="absolute z-1000 right-10 top-5 p-2 rounded-md bg-card-100 flex-col">
          <MainMenu />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMenuOpen(false)}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!sidebarOpen && (
          <Button
            variant="default"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-10 shadow-lg"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <div className="w-full h-full">
          <MapComponent
            events={filteredEvents}
            selectedEvent={selectedEvent}
            onEventSelect={setSelectedEvent}
          />
        </div>
      </div>
    </div>
  );
}

export default SmartCityEventsMapContent;
