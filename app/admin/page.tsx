"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";
import type { Category, Event } from "@/lib/types";
import { useRouter } from "next/navigation";

interface EventFormData {
  title: string;
  description: string;
  category_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  event_date_start: string;
  event_date_end: string;
  event_time_start: string;
  event_time_end: string;
  image_url: string;
  website_url: string;
  contact_info: string;
}

function formatTime(time: string) {
  let fixedTime = time;

  if (/\+\d{2}$/.test(time)) {
    fixedTime = time + ":00";
  }

  const date = new Date(`1970-01-01T${fixedTime}`);

  if (isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function AdminDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    category_id: "",
    location_name: "",
    latitude: 58.3806,
    longitude: 26.7251,
    event_date_start: "",
    event_date_end: "",
    event_time_start: "",
    event_time_end: "",
    image_url: "",
    website_url: "",
    contact_info: "",
  });
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/status", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("Client-side session data:", data.hasAccess);
        setIsAdmin(data.hasAccess);
      })
      .catch((err) => {
        setIsAdmin(false);
        console.error("Client-side fetch error:", err);
      });
  }, []);

  useEffect(() => {
    if (isAdmin === false) {
      router.push("/");
    }
  }, [isAdmin]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/events`);
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();

      // Normalize the returned data to match your Event type
      const normalized = (data || []).map((e: any) => ({
        ...e,
        category: Array.isArray(e.category)
          ? e.category[0] || null
          : e.category ?? null,
      }));

      setEvents(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const response = await fetch(`http://localhost:5000/api/categories`);
    const data = await response.json();

    if (!error && data) {
      setCategoriesList(data);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchEvents();
      fetchCategories();
    }
  }, [isAdmin]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category_id: "",
      location_name: "",
      latitude: 58.3806,
      longitude: 26.7251,
      event_date_start: "",
      event_date_end: "",
      event_time_start: "",
      event_time_end: "",
      image_url: "",
      website_url: "",
      contact_info: "",
    });
    setEditingEvent(null);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      category_id: event.category?.id ?? "",
      location_name: event.location_name,
      latitude: event.latitude,
      longitude: event.longitude,
      event_date_start: event.event_date_start?.slice(0, 10) ?? "",
      event_time_start: event.event_time_start?.slice(0, 5) ?? "",
      event_date_end: event.event_date_end?.slice(0, 10) ?? "",
      event_time_end: event.event_time_end?.slice(0, 5) ?? "",
      image_url: event.image_url || "",
      website_url: event.website_url || "",
      contact_info: event.contact_info || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const eventData: any = {
        title: formData.title,
        description: formData.description || null,
        location_name: formData.location_name,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        event_date_start: formData.event_date_start || null,
        event_time_start: formData.event_time_start || null,
        event_date_end: formData.event_date_end || null,
        event_time_end: formData.event_time_end || null,
        image_url: formData.image_url || null,
        website_url: formData.website_url || null,
        contact_info: formData.contact_info || null,
        category_id: formData.category_id,
      };

      if (editingEvent) {
        try {
          const response = await fetch("http://localhost:5000/api/events", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              eventData,
              id: editingEvent.id,
            }),
          });
          const result = await response.json();
          console.log(result);
        } catch (error) {
          console.error(error.message);
        }
      } else {
        const response = await fetch("http://localhost:5000/api/events", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          throw new Error("Failed to create event");
        }
      }

      await fetchEvents();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      await fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage events and city data</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Edit Event" : "Create New Event"}
              </DialogTitle>
              <DialogDescription>
                {editingEvent
                  ? "Update the event details below."
                  : "Fill in the details to create a new event."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesList.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location_name">Location Name *</Label>
                  <Input
                    id="location_name"
                    value={formData.location_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location_name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        latitude: Number.parseFloat(e.target.value),
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        longitude: Number.parseFloat(e.target.value),
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="event_date_start"
                    type="date"
                    value={formData.event_date_start}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        event_date_start: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">Start Time</Label>
                  <Input
                    id="event_time_start"
                    type="time"
                    value={formData.event_time_start ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        event_time_start: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="event_date_end"
                    type="date"
                    value={formData.event_date_end}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        event_date_end: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Time</Label>
                  <Input
                    id="event_time_end"
                    type="time"
                    value={formData.event_time_end ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        event_time_end: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        website_url: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        image_url: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="contact_info">Contact Information</Label>
                  <Input
                    id="contact_info"
                    value={formData.contact_info}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact_info: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingEvent ? "Update Event" : "Create Event"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">Events Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Events ({events.length})
              </CardTitle>
              <CardDescription>
                Manage all events in the Smart City Events Map
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading events...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((ev) => (
                        <TableRow key={ev.id}>
                          <TableCell className="font-medium">
                            {ev.title}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-xs ${
                                ev.category?.color ?? "bg-gray-200"
                              }`}
                            >
                              {ev.category?.name ?? "Uncategorized"}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {ev.location_name}
                          </TableCell>
                          <TableCell>
                            {new Date(ev.event_date_start).toLocaleDateString()}
                            {ev.event_date_end && (
                              <>
                                {" - " +
                                  new Date(
                                    ev.event_date_end
                                  ).toLocaleDateString()}
                              </>
                            )}
                          </TableCell>
                          <TableCell>
                            {ev.event_time_start
                              ? formatTime(ev.event_time_start)
                              : "None"}
                            {ev.event_time_end && (
                              <>{" - " + formatTime(ev.event_time_end)}</>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(ev)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(ev.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Events
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active events in the system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Categories
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    new Set(
                      events.map((e) => e.category?.name ?? "Uncategorized")
                    ).size
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Different event categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    events.filter((e) => {
                      const eventDate = new Date(e.event_date_start);
                      const now = new Date();
                      return (
                        eventDate.getMonth() === now.getMonth() &&
                        eventDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Events this month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
