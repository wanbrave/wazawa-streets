import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertPropertySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Property routes
  app.get("/api/properties", async (req, res) => {
    const filter = req.query.filter as string || "Available";
    const properties = await storage.getProperties(filter);
    res.json(properties);
  });

  app.get("/api/properties/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }
    
    const property = await storage.getProperty(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    res.json(property);
  });

  app.post("/api/properties", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const propertyData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Could not create property" });
    }
  });

  // Portfolio routes
  app.get("/api/portfolio", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userProperties = await storage.getUserProperties(req.user!.id);
    res.json(userProperties);
  });

  // Initialize properties if none exist
  await storage.initializeProperties();

  const httpServer = createServer(app);

  return httpServer;
}
