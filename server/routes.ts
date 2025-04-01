import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertPropertySchema, 
  updateUserProfileSchema,
  insertWalletTransactionSchema,
  insertPaymentCardSchema
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

  // Payment Card routes
  app.get("/api/cards", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const cards = await storage.getUserPaymentCards(req.user!.id);
      // Mask card numbers for security
      const maskedCards = cards.map(card => ({
        ...card,
        cardNumber: `**** **** **** ${card.lastFourDigits}` 
      }));
      res.json(maskedCards);
    } catch (error) {
      res.status(500).json({ message: "Could not fetch payment cards" });
    }
  });
  
  app.post("/api/cards", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Add user ID to card data
      const cardData = {
        ...req.body,
        userId: req.user!.id
      };
      
      // Validate card data
      const validatedCardData = insertPaymentCardSchema.parse(cardData);
      
      // Add payment card
      const card = await storage.addPaymentCard(validatedCardData);
      
      // Mask card number before returning
      const maskedCard = {
        ...card,
        cardNumber: `**** **** **** ${card.lastFourDigits}`
      };
      
      res.status(201).json(maskedCard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Could not add payment card" });
    }
  });
  
  app.delete("/api/cards/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const cardId = parseInt(req.params.id);
      if (isNaN(cardId)) {
        return res.status(400).json({ message: "Invalid card ID" });
      }
      
      // Get the card to check ownership
      const cards = await storage.getUserPaymentCards(req.user!.id);
      const cardToDelete = cards.find(card => card.id === cardId);
      
      if (!cardToDelete) {
        return res.status(404).json({ message: "Card not found or does not belong to the user" });
      }
      
      // Delete the card
      await storage.deletePaymentCard(cardId);
      
      res.json({ message: "Card deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Could not delete payment card" });
    }
  });
  
  app.post("/api/cards/:id/default", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const cardId = parseInt(req.params.id);
      if (isNaN(cardId)) {
        return res.status(400).json({ message: "Invalid card ID" });
      }
      
      // Get the card to check ownership
      const cards = await storage.getUserPaymentCards(req.user!.id);
      const cardToSetDefault = cards.find(card => card.id === cardId);
      
      if (!cardToSetDefault) {
        return res.status(404).json({ message: "Card not found or does not belong to the user" });
      }
      
      // Set as default
      const updatedCard = await storage.setDefaultPaymentCard(cardId, req.user!.id);
      
      // Mask card number before returning
      const maskedCard = {
        ...updatedCard,
        cardNumber: `**** **** **** ${updatedCard.lastFourDigits}`
      };
      
      res.json(maskedCard);
    } catch (error) {
      res.status(500).json({ message: "Could not set card as default" });
    }
  });

  // Initialize properties if none exist
  await storage.initializeProperties();

  const httpServer = createServer(app);

  return httpServer;
}
