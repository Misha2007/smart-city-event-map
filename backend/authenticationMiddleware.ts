import { createClient } from "@supabase/supabase-js";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authenticateUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const sessionToken = req.cookies[process.env.COOKIE_NAME!];

  console.log(sessionToken);
  if (!sessionToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No session token found" });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(sessionToken);

    if (error || !user) {
      console.error(error);
      return res.status(401).json({ message: "Unauthorized: Invalid session" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
