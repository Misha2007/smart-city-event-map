"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  X,
  Heart,
  HeartOff,
} from "lucide-react";
import type { Event } from "@/lib/types";

// Leaflet imports (dynamic to avoid SSR issues)
let L: any = null;

if (typeof window !== "undefined") {
  L = require("leaflet");
  require("leaflet");

  // Fix for default markers in Leaflet
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

interface MapComponentProps {
  events: Event[];
  selectedEvent: Event | null;
  onEventSelect: (event: Event | null) => void;
}

export default function MapComponent({
  events,
  selectedEvent,
  onEventSelect,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [showEventPopup, setShowEventPopup] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !L) return;

    // Tartu coordinates
    const tartuCenter: [number, number] = [58.3806, 26.7251];

    mapInstanceRef.current = L.map(mapRef.current).setView(tartuCenter, 13);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when events change
  useEffect(() => {
    if (!mapInstanceRef.current || !L) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    events.forEach((event) => {
      const coordinates: [number, number] = [event.latitude, event.longitude];
      const startDate = new Date(event.start_date);
      const formattedDate = startDate.toLocaleDateString();
      const formattedTime = startDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const marker = L.marker(coordinates)
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `
          <div class="p-2">
            <h3 class="font-medium text-sm mb-1">${event.title}</h3>
            <p class="text-xs text-gray-600 mb-2">${event.description || ""}</p>
            <div class="text-xs">
              <div class="flex items-center gap-1 mb-1">
                <span></span> ${formattedDate} at ${formattedTime}
              </div>
              <div class="flex items-center gap-1 mb-1">

<span></span> ${event.location_name}
              </div>
              <div class="flex items-center gap-1">
<span></span> ${event.category}
</div>
            </div>
          </div>
        `
        )
        .on("click", () => {
          onEventSelect(event);
          setShowEventPopup(true);
        });

      markersRef.current.push(marker);
    });
  }, [events, onEventSelect]);

  // Handle selected event
  useEffect(() => {
    if (selectedEvent && mapInstanceRef.current) {
      const coordinates: [number, number] = [
        selectedEvent.latitude,
        selectedEvent.longitude,
      ];
      mapInstanceRef.current.setView(coordinates, 15);
      setShowEventPopup(true);
    }
  }, [selectedEvent]);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Event popup overlay */}
      {showEventPopup && selectedEvent && (
        <div className="absolute top-4 right-4 z-[1000] max-w-sm">
          <Card className="p-4 shadow-lg bg-card border border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  {selectedEvent.title}
                </h3>
                <Badge className={`text-xs ${selectedEvent.category?.color}`}>
                  {selectedEvent.category?.name}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEventPopup(false);
                  onEventSelect(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {selectedEvent.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {selectedEvent.description}
              </p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatEventDate(selectedEvent.start_date).date}</span>
                <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                <span>{formatEventDate(selectedEvent.start_date).time}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{selectedEvent.location_name}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {selectedEvent.website_url && (
                <>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      window.open(selectedEvent.website_url!, "_blank")
                    }
                  >
                    Visit Website
                  </Button>

                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
