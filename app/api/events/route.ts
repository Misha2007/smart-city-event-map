import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const dateRange = searchParams.get("dateRange");

    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10);
    let query = supabase
      .from("events")
      .select(
        `
    id,
    title,
    description,
    event_date_start,
    event_time_start,
    event_date_end,
    event_time_end,
    location_name,
    latitude,
    longitude,
    category:categories (
      id,
      name,
      slug,
      icon,
      color
    )
  `
      )
      .or(`event_date_end.gte.${today},event_date_start.gte.${today}`)
      .order("event_date_start", { ascending: true });

    // Apply category filter
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Apply search filter
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,location_name.ilike.%${search}%`
      );
    }

    // Apply date range filter
    if (dateRange && dateRange !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          query = query.gte("event_date_start", startDate.toISOString());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          query = query.gte("event_date_start", startDate.toISOString());
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          query = query.gte("event_date_start", startDate.toISOString());
          break;
      }
    }

    console.log("[v0] Executing database query");
    const { data: events, error } = await query;

    if (error) {
      console.error("[v0] Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch events", details: error.message },
        { status: 500 }
      );
    }

    console.log("[v0] Successfully fetched", events?.length || 0, "events");
    return NextResponse.json(events || []);
  } catch (error) {
    console.error("[v0] API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
