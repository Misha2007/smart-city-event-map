"use client";

import { useState } from "react";
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
import { MapPin, Calendar, Clock, Search, Filter, Menu, X } from "lucide-react";
import type { Event, EventFilters } from "@/lib/types";

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

// Static events array
const eventsData: Event[] = [
  {
    id: "1",
    title: "Music Festival",
    description: "Enjoy live music in the city center",
    start_date: "2025-09-12T18:00:00",
    location_name: "City Park",
    category: "Festival",
  },
  {
    id: "2",
    title: "Art Exhibition",
    description: "Local artists showcase their work",
    start_date: "2025-09-13T10:00:00",
    location_name: "Art Gallery",
    category: "Culture",
  },
];

function SmartCityEventsMapContent() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState<EventFilters>({
    category: "all",
    search: "",
    dateRange: "all",
  });

  const filteredEvents = eventsData.filter((event) => {
    const matchesCategory =
      filters.category === "all" || event.category === filters.category;
    const matchesSearch = event.title
      .toLowerCase()
      .includes(filters.search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      Festival:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Culture:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      Nature:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Education:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Sports: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Technology:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    };
    return (
      colors[category] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    );
  };

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
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
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
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
                  <h4 className="font-medium text-sm text-foreground">
                    {event.title}
                  </h4>
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
                    className={`text-xs ${getCategoryColor(event.category)}`}
                  >
                    {event.category}
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
        <div className="w-full h-full"></div>
      </div>
    </div>
  );
}

export default SmartCityEventsMapContent;
