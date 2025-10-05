"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock } from "lucide-react";
import type { Event } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function FavoriteEventsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/favorites", {
          credentials: "include",
        });

        if (response.status === 401) {
          router.push("/");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }

        const { favorites } = await response.json();
        setFavorites(favorites);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [router]);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">My Favorite Events</h1>
      {loading ? (
        <p>Loading favorites...</p>
      ) : favorites.length === 0 ? (
        <p className="text-muted-foreground">No favorite events yet.</p>
      ) : (
        <div className="space-y-4">
          {favorites.map((event) => {
            return (
              <Card key={event.id} className="p-4">
                <h4 className="font-medium text-lg">{event.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {event.event_date_start}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {event.event_time_start}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.location_name}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
