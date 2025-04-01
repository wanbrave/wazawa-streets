import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertPropertySchema, 
  updateUserProfileSchema,
  insertWalletTransactionSchema
} from "@shared/schema";
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
  
  app.post("/api/properties/:id/invest", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      const { amount } = req.body;
      const investmentAmount = parseFloat(amount);
      
      if (isNaN(investmentAmount) || investmentAmount <= 0) {
        return res.status(400).json({ message: "Invalid investment amount" });
      }
      
      // Check property exists
      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Check property is available
      if (property.filter !== "Available") {
        return res.status(400).json({ message: "Property is not available for investment" });
      }
      
      // Check wallet balance
      const walletBalance = await storage.getUserWalletBalance(req.user!.id);
      if (walletBalance < investmentAmount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      
      // Calculate shares (simple 1:1 ratio for now)
      const shares = investmentAmount;
      
      // Add user property record
      const userProperty = await storage.addUserProperty({
        userId: req.user!.id,
        propertyId,
        investmentAmount,
        dateInvested: new Date().toISOString(),
        shares,
        status: "active"
      });
      
      // Deduct from wallet balance
      await storage.updateWalletBalance(req.user!.id, -investmentAmount);
      
      // Add wallet transaction
      await storage.addWalletTransaction({
        userId: req.user!.id,
        amount: -investmentAmount,
        type: "investment",
        description: `Investment in property: ${property.title}`,
        relatedPropertyId: propertyId
      });
      
      res.status(201).json({
        message: "Investment successful",
        investment: userProperty
      });
    } catch (error) {
      res.status(500).json({ message: "Could not process investment" });
    }
  });
  
  // Wallet routes
  app.get("/api/wallet", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const walletBalance = await storage.getUserWalletBalance(req.user!.id);
    res.json({ balance: walletBalance });
  });
  
  app.post("/api/wallet/deposit", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { amount } = req.body;
      const numAmount = parseFloat(amount);
      
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Update wallet balance
      await storage.updateWalletBalance(req.user!.id, numAmount);
      
      // Add transaction record
      await storage.addWalletTransaction({
        userId: req.user!.id,
        amount: numAmount,
        type: "deposit",
        description: "Funds deposited to wallet",
        relatedPropertyId: null
      });
      
      const walletBalance = await storage.getUserWalletBalance(req.user!.id);
      res.json({ 
        message: "Deposit successful", 
        balance: walletBalance 
      });
    } catch (error) {
      res.status(500).json({ message: "Could not process deposit" });
    }
  });
  
  app.post("/api/wallet/withdraw", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { amount } = req.body;
      const numAmount = parseFloat(amount);
      
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const currentBalance = await storage.getUserWalletBalance(req.user!.id);
      if (currentBalance < numAmount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // Update wallet balance (negative amount for withdrawal)
      await storage.updateWalletBalance(req.user!.id, -numAmount);
      
      // Add transaction record
      await storage.addWalletTransaction({
        userId: req.user!.id,
        amount: -numAmount,
        type: "withdrawal",
        description: "Funds withdrawn from wallet",
        relatedPropertyId: null
      });
      
      const walletBalance = await storage.getUserWalletBalance(req.user!.id);
      res.json({ 
        message: "Withdrawal successful", 
        balance: walletBalance 
      });
    } catch (error) {
      res.status(500).json({ message: "Could not process withdrawal" });
    }
  });
  
  app.get("/api/wallet/transactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const transactions = await storage.getWalletTransactions(req.user!.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Could not fetch transactions" });
    }
  });
  
  // User profile routes
  app.get("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    res.json(req.user);
  });
  
  app.patch("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const profileData = updateUserProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUserProfile(req.user!.id, profileData);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Could not update profile" });
    }
  });

  // Initialize properties if none exist
  await storage.initializeProperties();

  const httpServer = createServer(app);

  return httpServer;
}
