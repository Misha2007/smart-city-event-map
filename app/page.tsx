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
  Clock,
  Search,
  Filter,
  Menu,
  X,
  Heart,
  HeartOff,
} from "lucide-react";
import type { Event, Category, EventFilters } from "@/lib/types";
import AuthButton from "@/components/auth-button";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { createClient } from "@/lib/supabase/client";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-muted-foreground">Loading map...</div>
    </div>
  ),
});

const categories = [
  "all",
  "Festival",
  "Culture",
  "Nature",
  "Education",
  "Sports",
  "Technology",
];
const dateRanges = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

function SmartCityEventsMapContent() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState<EventFilters>({
    category: "all",
    search: "",
    dateRange: "all",
  });
  const supabase = createClient();
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

    const eventDate = new Date(event.start_date);
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

      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      setEventsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("user_favorites")
        .select("event_id")
        .eq("user_id", user.id);

      if (data) {
        setFavoriteIds(data.map((fav) => fav.event_id));
      }
    };

    fetchFavorites();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const toggleFavorite = async (eventId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const isFav = favoriteIds.includes(eventId);

    if (isFav) {
      await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("event_id", eventId);

      setFavoriteIds((prev) => prev.filter((id) => id !== eventId));
    } else {
      const response = await supabase.from("user_favorites").insert({
        user_id: user.id,
        event_id: eventId,
      });

      console.log("Favorite added:", response, eventId);

      setFavoriteIds((prev) => [...prev, eventId]);
    }
  };

  const fetchCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, icon, color")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return data ?? [];
  };

  useEffect(() => {
    const getCategories = async () => {
      const cats = await fetchCategories();
      setCategories(cats);
    };

    getCategories();
  }, []);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="h-screen flex bg-background">
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
            <h3 className="text-sm font-medium text-foreground">Events</h3>
            {filteredEvents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No events found.
              </p>
            )}
            {filteredEvents.map((event) => {
              const { date, time } = formatEventDate(event.start_date);
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
                  </div>

                  {event.description && (
                    <p className="text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    {date}
                    <Clock className="h-3 w-3 ml-2" />
                    {time}
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
