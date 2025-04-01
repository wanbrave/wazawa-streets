import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertPropertySchema, 
  updateUserProfileSchema,
  insertWalletTransactionSchema,
  insertPaymentCardSchema,
  insertPropertyImageSchema,
  insertPropertyDocumentSchema,
  insertAdminAuditLogSchema,
  adminUpdateUserSchema,
  adminUpdatePropertySchema
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
      const { amount, method, provider, phoneNumber, cardId, cvv } = req.body;
      const numAmount = parseFloat(amount);
      
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      let description = "Funds deposited to wallet";
      let organization = "-";
      let account = "-";
      
      // Different handling based on deposit method
      if (method === "card" && cardId) {
        // Get the user's cards to verify ownership
        const cards = await storage.getUserPaymentCards(req.user!.id);
        const selectedCard = cards.find(card => card.id === parseInt(cardId));
        
        if (!selectedCard) {
          return res.status(404).json({ message: "Card not found or does not belong to user" });
        }
        
        description = `Deposit via card ending in ${selectedCard.lastFourDigits}`;
        organization = selectedCard.cardType || "Card"; // Visa, Mastercard, etc.
        account = `**** ${selectedCard.lastFourDigits}`;
      } 
      else if (method === "mobile-money" && provider && phoneNumber) {
        description = `Deposit via ${provider} (${phoneNumber})`;
        organization = provider;
        account = phoneNumber;
      }
      
      // Update wallet balance
      await storage.updateWalletBalance(req.user!.id, numAmount);
      
      // Add transaction record
      await storage.addWalletTransaction({
        userId: req.user!.id,
        amount: numAmount,
        type: "deposit",
        method,
        organization,
        account,
        description,
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
      const { 
        amount, 
        method, 
        bankName,
        accountNumber,
        accountName,
        branchName,
        swiftCode
      } = req.body;
      
      const numAmount = parseFloat(amount);
      
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const currentBalance = await storage.getUserWalletBalance(req.user!.id);
      if (currentBalance < numAmount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      let description = "Funds withdrawn from wallet";
      let organization = "-";
      let account = "-";
      
      // Different handling based on withdrawal method
      if (method === "bank" && bankName && accountNumber) {
        const maskedAccount = accountNumber.slice(-4).padStart(accountNumber.length, '*');
        description = `Withdrawal to ${bankName} account ${maskedAccount} (${accountName})`;
        organization = bankName;
        account = maskedAccount;
      }
      
      // Update wallet balance (negative amount for withdrawal)
      await storage.updateWalletBalance(req.user!.id, -numAmount);
      
      // Add transaction record
      await storage.addWalletTransaction({
        userId: req.user!.id,
        amount: -numAmount,
        type: "withdrawal",
        method: method || "bank",
        organization,
        account,
        description,
        relatedPropertyId: null
      });
      
      const walletBalance = await storage.getUserWalletBalance(req.user!.id);
      res.json({ 
        message: "Withdrawal request received", 
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

  // Property images routes
  app.get("/api/properties/:id/images", async (req, res) => {
    const propertyId = parseInt(req.params.id);
    if (isNaN(propertyId)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }
    
    try {
      const images = await storage.getPropertyImages(propertyId);
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Could not fetch property images" });
    }
  });
  
  // Property documents routes
  app.get("/api/properties/:id/documents", async (req, res) => {
    const propertyId = parseInt(req.params.id);
    if (isNaN(propertyId)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }
    
    try {
      const documents = await storage.getPropertyDocuments(propertyId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Could not fetch property documents" });
    }
  });
  
  // Admin middleware to check admin role
  const isAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden - Admin access required" });
    }
    
    next();
  };
  
  // Admin routes
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Could not fetch users" });
    }
  });
  
  app.get("/api/admin/properties", isAdmin, async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Could not fetch properties" });
    }
  });
  
  app.get("/api/admin/transactions", isAdmin, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Could not fetch transactions" });
    }
  });
  
  app.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const userData = adminUpdateUserSchema.parse(req.body);
      const updatedUser = await storage.updateUserByAdmin(userId, userData);
      
      // Log admin action
      await storage.addAdminAuditLog({
        adminId: req.user!.id,
        action: "Updated user",
        entityType: "User",
        entityId: userId,
        details: JSON.stringify(userData),
        ipAddress: req.ip || null
      });
      
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Could not update user" });
    }
  });
  
  app.patch("/api/admin/properties/:id", isAdmin, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      const propertyData = adminUpdatePropertySchema.parse(req.body);
      const updatedProperty = await storage.updatePropertyByAdmin(propertyId, propertyData);
      
      // Log admin action
      await storage.addAdminAuditLog({
        adminId: req.user!.id,
        action: "Updated property",
        entityType: "Property",
        entityId: propertyId,
        details: JSON.stringify(propertyData),
        ipAddress: req.ip || null
      });
      
      res.json(updatedProperty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Could not update property" });
    }
  });
  
  app.post("/api/admin/properties/:id/images", isAdmin, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      const imageData = {
        ...req.body,
        propertyId
      };
      
      const validatedImageData = insertPropertyImageSchema.parse(imageData);
      const image = await storage.addPropertyImage(validatedImageData);
      
      // Log admin action
      await storage.addAdminAuditLog({
        adminId: req.user!.id,
        action: "Added property image",
        entityType: "PropertyImage",
        entityId: image.id,
        details: `Added image to property ID ${propertyId}`,
        ipAddress: req.ip || null
      });
      
      res.status(201).json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Could not add property image" });
    }
  });
  
  app.delete("/api/admin/properties/images/:id", isAdmin, async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      if (isNaN(imageId)) {
        return res.status(400).json({ message: "Invalid image ID" });
      }
      
      await storage.deletePropertyImage(imageId);
      
      // Log admin action
      await storage.addAdminAuditLog({
        adminId: req.user!.id,
        action: "Deleted property image",
        entityType: "PropertyImage",
        entityId: imageId,
        details: null,
        ipAddress: req.ip || null
      });
      
      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Could not delete property image" });
    }
  });
  
  app.post("/api/admin/properties/:id/documents", isAdmin, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      const docData = {
        ...req.body,
        propertyId,
        uploadedBy: req.user!.id
      };
      
      const validatedDocData = insertPropertyDocumentSchema.parse(docData);
      const document = await storage.addPropertyDocument(validatedDocData);
      
      // Log admin action
      await storage.addAdminAuditLog({
        adminId: req.user!.id,
        action: "Added property document",
        entityType: "PropertyDocument",
        entityId: document.id,
        details: `Added document "${document.title}" to property ID ${propertyId}`,
        ipAddress: req.ip || null
      });
      
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Could not add property document" });
    }
  });
  
  app.delete("/api/admin/properties/documents/:id", isAdmin, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      await storage.deletePropertyDocument(documentId);
      
      // Log admin action
      await storage.addAdminAuditLog({
        adminId: req.user!.id,
        action: "Deleted property document",
        entityType: "PropertyDocument",
        entityId: documentId,
        details: null,
        ipAddress: req.ip || null
      });
      
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Could not delete property document" });
    }
  });
  
  app.get("/api/admin/audit-logs", isAdmin, async (req, res) => {
    try {
      const auditLogs = await storage.getAdminAuditLogs();
      res.json(auditLogs);
    } catch (error) {
      res.status(500).json({ message: "Could not fetch audit logs" });
    }
  });
  
  // Initialize properties if none exist
  await storage.initializeProperties();

  const httpServer = createServer(app);

  return httpServer;
}
