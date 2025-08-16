import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running with Supabase" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
