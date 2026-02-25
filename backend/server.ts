import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import cookieParser from "cookie-parser";
import { authenticateUser } from "./authenticationMiddleware.js";
import {
  Client,
  Environment,
  OrdersController,
  ApiError,
  OrderApplicationContextUserAction,
  CheckoutPaymentIntent
} from "@paypal/paypal-server-sdk";
import type { OrderRequest } from "@paypal/paypal-server-sdk";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 5000;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "SUPABASE_URL or SUPABASE_KEY is not defined in the .env file"
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

declare global {
  namespace Express {
    interface Request {
      user?: import("@supabase/supabase-js").User;
    }
  }
}
const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  environment: Environment.Sandbox,
  timeout: 10000,
});

const ordersController = new OrdersController(client);

app.use(cookieParser());

app.get("/", (req, res) => {
  // res.send("Hello, World!");
});

app.get("/supabase", (req, res) => {
  res.json({
    SUPABASE_URL,
    SUPABASE_KEY,
  });
});

app.get("/api/events", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
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

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/events", authenticateUser, async (req, res) => {
  try {
    const eventData = req.body;

    const { data, error } = await supabase.from("events").insert([eventData]);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error("Event creation error:", err);
    res.status(500).json({ message: "Failed to create event" });
  }
});

app.delete("/api/events/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Event deletion error:", err);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

app.patch("/api/events", async (req, res) => {
  try {
    console.log(req.body);
    const { eventData, id } = req.body;
    const { data, error } = await supabase
      .from("events")
      .update(eventData)
      .eq("id", id);

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, color")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/session", authenticateUser, async (req, res) => {
  try {
    const user = req.user;
    const [roleResult, profileResult] = await Promise.all([
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .single(),
    ]);

    if (roleResult.error && roleResult.error.code !== "PGRST116") {
      throw roleResult.error;
    }
    if (profileResult.error && profileResult.error.code !== "PGRST116") {
      throw profileResult.error;
    }

    const sessionData = {
      user: user,
      role: roleResult.data?.role || "user",
      profile: profileResult.data || null,
    };

    res.status(200).json(sessionData);
  } catch (error) {
    console.error("Error fetching full user session:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      return res.status(401).json({ error: error.message });
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    res.cookie(process.env.COOKIE_NAME!, data?.session?.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      expires: expirationDate,
    });

    res.json({ message: "Login successful", user: data.user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "An error occurred during login" });
  }
});

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.FRONTEND_URL,
      },
    });

    if (error) {
      console.error("Registration error:", error);
      return res.status(400).json({ error: error.message });
    }

    if (!data.user) {
      return res.status(400).json({ error: "User registration failed" });
    }

    res.json({ message: "Registration successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "An error occurred during login" });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie(process.env.COOKIE_NAME!);
  res.json({ message: "Logged out successfully" });
});

app.get("/api/profile", authenticateUser, async (req, res) => {
  try {
    const { user } = req; // Get the authenticated user from the middleware

    // Fetch profile details
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, bio")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return res
        .status(500)
        .json({ message: "Error fetching profile", error: profileError });
    }

    // Include user info (email, id) along with profile data
    const responsePayload = {
      user: {
        email: user.email,
        id: user.id,
        // Add more user info if needed
      },
      profile: profile || { display_name: "", avatar_url: "", bio: "" }, // Default if no profile
    };

    return res.json(responsePayload); // Send both user info and profile
  } catch (error) {
    return res.status(500).json({ message: "Error fetching profile", error });
  }
});

app.get("/api/favorites", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("user_favorites")
      .select("event_id, events(*)")
      .eq("user_id", userId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const events = data.flatMap((fav) => fav.events);

    res.json({ favorites: events });
  } catch (error) {
    console.error("Failed to fetch favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

app.get("/api/admin/status", authenticateUser, async (req, res) => {
  const user = req.user;

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return res.status(200).json({
    hasAccess: roleData?.role === "admin" || roleData?.role === "moderator",
  });
});

app.post("/api/favorites/toggle", authenticateUser, async (req, res) => {
  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: "Missing eventId" });
  }

  try {
    const userId = req.user.id;

    const { data: existingFavs, error: selectError } = await supabase
      .from("user_favorites")
      .select()
      .eq("user_id", userId)
      .eq("event_id", eventId);

    if (selectError)
      return res.status(500).json({ error: selectError.message });

    if (existingFavs.length > 0) {
      const { error: deleteError } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("event_id", eventId);

      if (deleteError)
        return res.status(500).json({ error: deleteError.message });

      res.json({ message: "Favorite removed", eventId });
    } else {
      const { error: insertError } = await supabase
        .from("user_favorites")
        .insert([{ user_id: userId, event_id: eventId }]);

      if (insertError)
        return res.status(500).json({ error: insertError.message });

      res.json({ message: "Favorite added", eventId });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to toggle favorite" });
  }
});

app.get("/api/movies", async (req, res) => {
  try {
    const { data: movieLanguages } = await supabase
      .from("movie_languages")
      .select("movie:movies(*), language:languages(name)");

    const { data: movieSubtitles } = await supabase
      .from("movie_subtitles")
      .select("movie:movies(*), subtitle:subtitles(name)");

    const { data: movieFormats } = await supabase
      .from("movie_formats")
      .select("movie:movies(*), format:formats(name)");

    const { data: movieGenres } = await supabase
      .from("movie_genres")
      .select("movie:movies(*), genre:genres(name)");

    const moviesMap = {};

    function addToMovieMap(source, key, nestedKey) {
      for (const row of source) {
        const movie = row.movie;
        if (!moviesMap[movie.id]) {
          moviesMap[movie.id] = {
            ...movie,
            genres: [],
            languages: [],
            subtitles: [],
            formats: [],
          };
        }

        const value = row[nestedKey]?.name;
        if (value && !moviesMap[movie.id][key].includes(value)) {
          moviesMap[movie.id][key].push(value);
        }
      }
    }

    addToMovieMap(movieLanguages, "languages", "language");
    addToMovieMap(movieSubtitles, "subtitles", "subtitle");
    addToMovieMap(movieFormats, "formats", "format");
    addToMovieMap(movieGenres, "genres", "genre");

    const movies = Object.values(moviesMap);

    res.json(movies);
  } catch (error) {
    console.error("Failed to fetch favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

app.get("/api/movies/genres", async (req, res) => {
  try {
    const { data: genres } = await supabase.from("genres").select("*");
    res.json(genres);
  } catch (error) {
    console.error("Failed to fetch favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

app.get("/api/movies/languages", async (req, res) => {
  try {
    const { data: languages } = await supabase.from("languages").select("*");
    res.json(languages);
  } catch (error) {
    console.error("Failed to fetch favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

app.get("/api/movies/subtitles", async (req, res) => {
  try {
    const { data: subtitles } = await supabase.from("subtitles").select("*");
    res.json(subtitles);
  } catch (error) {
    console.error("Failed to fetch favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

app.get("/api/movies/formats", async (req, res) => {
  try {
    const { data: formats } = await supabase.from("formats").select("*");
    res.json(formats);
  } catch (error) {
    console.error("Failed to fetch favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

app.post("/api/paypal/order/create", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    // Construct the order request for a donation
    const body: OrderRequest = {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: "USD",
              value: amount.toString(),
            },
          },
        ],
        applicationContext: {
          returnUrl: "",
          shippingPreference: "NO_SHIPPING"  as any,
          userAction: OrderApplicationContextUserAction.PayNow,
        },
    };

    console.log("Creating PayPal order with:", body);

    const ordersController = new OrdersController(client);
    console.log(
      "ordersController prototype methods:",
      Object.getOwnPropertyNames(Object.getPrototypeOf(ordersController))
    );
    console.log("ordersController own keys:", Object.keys(ordersController));

    // Create the order using OrdersController
    const { result } = await ordersController.createOrder({
      body,
    });
    console.log("PayPal order created:", result);
    // Extract the approval URL
    const approvalUrl = result.links.find(
      (link: any) => link.rel === "approve"
    )?.href;

    if (!approvalUrl) {
      return res
        .status(500)
        .json({ error: "Approval URL not found in the PayPal response" });
    }

    // Send the approval URL to the client for redirecting the user
    return res.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      const errors = error.result;
      console.error("PayPal API Error:", errors);
      return res
        .status(500)
        .json({ error: "Error creating PayPal order", details: errors });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

app.post("/api/paypal/order/capture", async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: "orderId is required" });
    console.log("Capturing PayPal order with ID:", orderId);
    const { result } = await ordersController.captureOrder({ id: orderId });
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error capturing order" });
  }
});

app.listen(port, () => {
  console.log(`Backend is running on http://localhost:${port}`);
});
