import { 
  users, type User, type InsertUser,
  properties, type Property, type InsertProperty,
  userProperties, type UserProperty, type InsertUserProperty,
  walletTransactions, type WalletTransaction, type InsertWalletTransaction,
  paymentCards, type PaymentCard, type InsertPaymentCard,
  propertyImages, type PropertyImage, type InsertPropertyImage,
  propertyDocuments, type PropertyDocument, type InsertPropertyDocument,
  adminAuditLogs, type AdminAuditLog, type InsertAdminAuditLog,
  type UpdateUserProfile, type AdminUpdateUser, type AdminUpdateProperty
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import pkg from 'pg';
const { Pool } = pkg;

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: number, profileData: UpdateUserProfile): Promise<User>;
  
  // Property operations
  getProperties(filter: string): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  initializeProperties(): Promise<void>;
  
  // User-Property operations
  getUserProperties(userId: number): Promise<(UserProperty & { property: Property })[]>;
  addUserProperty(userProperty: InsertUserProperty): Promise<UserProperty>;
  
  // Wallet operations
  getUserWalletBalance(userId: number): Promise<number>;
  updateWalletBalance(userId: number, amount: number): Promise<User>;
  addWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  getWalletTransactions(userId: number): Promise<WalletTransaction[]>;
  
  // Payment Card operations
  addPaymentCard(card: InsertPaymentCard): Promise<PaymentCard>;
  getUserPaymentCards(userId: number): Promise<PaymentCard[]>;
  deletePaymentCard(cardId: number): Promise<void>;
  setDefaultPaymentCard(cardId: number, userId: number): Promise<PaymentCard>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAllProperties(): Promise<Property[]>;
  updatePropertyByAdmin(propertyId: number, data: AdminUpdateProperty): Promise<Property>;
  updateUserByAdmin(userId: number, data: AdminUpdateUser): Promise<User>;
  getAllTransactions(): Promise<WalletTransaction[]>;
  
  // Property images operations
  addPropertyImage(image: InsertPropertyImage): Promise<PropertyImage>;
  getPropertyImages(propertyId: number): Promise<PropertyImage[]>;
  deletePropertyImage(imageId: number): Promise<void>;
  
  // Property document operations
  addPropertyDocument(doc: InsertPropertyDocument): Promise<PropertyDocument>;
  getPropertyDocuments(propertyId: number): Promise<PropertyDocument[]>;
  deletePropertyDocument(docId: number): Promise<void>;
  
  // Admin audit logs
  addAdminAuditLog(log: InsertAdminAuditLog): Promise<AdminAuditLog>;
  getAdminAuditLogs(): Promise<AdminAuditLog[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  // Storage
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private userProperties: Map<number, UserProperty>;
  private walletTransactions: Map<number, WalletTransaction>;
  private paymentCards: Map<number, PaymentCard>;
  private propertyImages: Map<number, PropertyImage>;
  private propertyDocuments: Map<number, PropertyDocument>;
  private adminAuditLogs: Map<number, AdminAuditLog>;
  
  // IDs
  private userCurrentId: number;
  private propertyCurrentId: number;
  private userPropertyCurrentId: number;
  private walletTransactionCurrentId: number;
  private paymentCardCurrentId: number;
  private propertyImageCurrentId: number;
  private propertyDocumentCurrentId: number;
  private adminAuditLogCurrentId: number;
  
  // Session store
  sessionStore: session.Store;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.properties = new Map();
    this.userProperties = new Map();
    this.walletTransactions = new Map();
    this.paymentCards = new Map();
    this.propertyImages = new Map();
    this.propertyDocuments = new Map();
    this.adminAuditLogs = new Map();
    
    // Initialize IDs
    this.userCurrentId = 1;
    this.propertyCurrentId = 1;
    this.userPropertyCurrentId = 1;
    this.walletTransactionCurrentId = 1;
    this.paymentCardCurrentId = 1;
    this.propertyImageCurrentId = 1;
    this.propertyDocumentCurrentId = 1;
    this.adminAuditLogCurrentId = 1;
    
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    
    const user: User = { 
      ...insertUser, 
      id,
      walletBalance: 0,
      fullName: insertUser.fullName || null,
      email: insertUser.email || null,
      phoneNumber: insertUser.phoneNumber || null,
      avatarUrl: null,
      role: insertUser.role || "user",
      isVerified: false,
      createdAt: now,
      lastLogin: null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserProfile(userId: number, profileData: UpdateUserProfile): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = { ...user, ...profileData };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Property operations
  async getProperties(filter: string): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      property => property.filter === filter
    );
  }
  
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }
  
  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.propertyCurrentId++;
    const now = new Date();
    
    const property: Property = { 
      ...insertProperty, 
      id,
      createdAt: now,
      updatedAt: now,
      completionDate: null,
      description: insertProperty.description || null,
      floorArea: insertProperty.floorArea || null,
      yearBuilt: insertProperty.yearBuilt || null,
      parkingSpaces: insertProperty.parkingSpaces || null,
      monthlyRent: insertProperty.monthlyRent || null,
      serviceCharges: insertProperty.serviceCharges || null,
      maintenanceFees: insertProperty.maintenanceFees || null,
      occupancyRate: insertProperty.occupancyRate || null,
      adminId: insertProperty.adminId || null
    };
    
    this.properties.set(id, property);
    return property;
  }
  
  async initializeProperties(): Promise<void> {
    // Check if properties already exist
    if (this.properties.size > 0) {
      return;
    }
    
    // Sample properties
    const sampleProperties: InsertProperty[] = [
      {
        title: "2 Bed in Golden Estate, Masaki",
        location: "Golden Estate",
        city: "Dar es Salaam",
        bedrooms: 2,
        price: "TZS 450,000,000",
        imageUrl: "https://images.unsplash.com/photo-1582407947304-fd6169a9d7e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        type: "Balanced",
        fundingPercentage: 80,
        yearlyReturn: 10.08,
        totalReturn: 50.42,
        projectedYield: 5.40,
        propertyId: "908",
        status: "Ready",
        filter: "Available"
      },
      {
        title: "1 Bed in Peninsula Apartments, Msasani",
        location: "Peninsula",
        city: "Dar es Salaam",
        bedrooms: 1,
        price: "TZS 380,000,000",
        imageUrl: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        type: "Balanced",
        fundingPercentage: 79,
        yearlyReturn: 9.71,
        totalReturn: 48.54,
        projectedYield: 5.16,
        propertyId: "2711",
        status: "Rented",
        filter: "Available"
      },
      {
        title: "Studio in Urban Residence, Upanga",
        location: "Urban Residence",
        city: "Dar es Salaam",
        bedrooms: 0,
        price: "TZS 250,000,000",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        type: "Capital Growth",
        fundingPercentage: 46,
        yearlyReturn: 9.70,
        totalReturn: 48.51,
        projectedYield: 5.32,
        propertyId: "4112",
        status: "Rented",
        filter: "Available"
      },
      {
        title: "3 Bed Villa, Mikocheni",
        location: "Mikocheni",
        city: "Dar es Salaam",
        bedrooms: 3,
        price: "TZS 650,000,000",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        type: "Capital Growth",
        fundingPercentage: 100,
        yearlyReturn: 8.50,
        totalReturn: 42.50,
        projectedYield: 4.20,
        propertyId: "5243",
        status: "Rented",
        filter: "Funded"
      },
      {
        title: "2 Bed in Regent Estate, Kinondoni",
        location: "Regent Estate",
        city: "Dar es Salaam",
        bedrooms: 2,
        price: "TZS 520,000,000",
        imageUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        type: "Balanced",
        fundingPercentage: 100,
        yearlyReturn: 10.20,
        totalReturn: 51.00,
        projectedYield: 5.50,
        propertyId: "3651",
        status: "Rented",
        filter: "Funded"
      },
      {
        title: "1 Bed in City Centre, Kivukoni",
        location: "City Centre",
        city: "Dar es Salaam",
        bedrooms: 1,
        price: "TZS 320,000,000",
        imageUrl: "https://images.unsplash.com/photo-1577495508326-19a1b3cf65b9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        type: "Balanced",
        fundingPercentage: 0,
        yearlyReturn: 9.80,
        totalReturn: 49.00,
        projectedYield: 5.10,
        propertyId: "7823",
        status: "Exited",
        filter: "Exited"
      }
    ];
    
    // Add properties to storage
    for (const property of sampleProperties) {
      await this.createProperty(property);
    }
  }
  
  // User-Property operations
  async getUserProperties(userId: number): Promise<(UserProperty & { property: Property })[]> {
    const userProps = Array.from(this.userProperties.values()).filter(
      up => up.userId === userId
    );
    
    return userProps.map(up => {
      const property = this.properties.get(up.propertyId);
      if (!property) {
        throw new Error(`Property with ID ${up.propertyId} not found`);
      }
      return { ...up, property };
    });
  }
  
  async addUserProperty(insertUserProperty: InsertUserProperty): Promise<UserProperty> {
    const id = this.userPropertyCurrentId++;
    const userProperty: UserProperty = { 
      ...insertUserProperty, 
      id,
      status: insertUserProperty.status || "active" 
    };
    this.userProperties.set(id, userProperty);
    return userProperty;
  }
  
  // Wallet operations
  async getUserWalletBalance(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return user.walletBalance;
  }
  
  async updateWalletBalance(userId: number, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = { 
      ...user, 
      walletBalance: user.walletBalance + amount 
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async addWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const id = this.walletTransactionCurrentId++;
    const now = new Date();
    const walletTransaction: WalletTransaction = {
      ...transaction,
      id,
      date: now,
      method: transaction.method || "standard",
      organization: transaction.organization || "-",
      account: transaction.account || "-",
      relatedPropertyId: transaction.relatedPropertyId === undefined ? null : transaction.relatedPropertyId
    };
    
    this.walletTransactions.set(id, walletTransaction);
    return walletTransaction;
  }
  
  async getWalletTransactions(userId: number): Promise<WalletTransaction[]> {
    return Array.from(this.walletTransactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
  }

  // Payment Card operations
  async addPaymentCard(insertCard: InsertPaymentCard): Promise<PaymentCard> {
    const id = this.paymentCardCurrentId++;
    
    // Extract last 4 digits from card number
    const lastFourDigits = insertCard.cardNumber.slice(-4);
    
    const paymentCard: PaymentCard = {
      ...insertCard,
      id,
      lastFourDigits,
      isDefault: false
    };
    
    // If this is the first card for the user, make it the default
    const userCards = await this.getUserPaymentCards(insertCard.userId);
    if (userCards.length === 0) {
      paymentCard.isDefault = true;
    }
    
    this.paymentCards.set(id, paymentCard);
    return paymentCard;
  }
  
  async getUserPaymentCards(userId: number): Promise<PaymentCard[]> {
    return Array.from(this.paymentCards.values())
      .filter(card => card.userId === userId);
  }
  
  async deletePaymentCard(cardId: number): Promise<void> {
    const card = this.paymentCards.get(cardId);
    if (!card) {
      throw new Error(`Payment card with ID ${cardId} not found`);
    }
    
    this.paymentCards.delete(cardId);
    
    // If the deleted card was the default, set another card as default
    if (card.isDefault) {
      const userCards = await this.getUserPaymentCards(card.userId);
      if (userCards.length > 0) {
        const newDefaultCard = userCards[0];
        await this.setDefaultPaymentCard(newDefaultCard.id, card.userId);
      }
    }
  }
  
  async setDefaultPaymentCard(cardId: number, userId: number): Promise<PaymentCard> {
    // First, set all user's cards to non-default
    const userCards = await this.getUserPaymentCards(userId);
    for (const card of userCards) {
      const updatedCard = { ...card, isDefault: false };
      this.paymentCards.set(card.id, updatedCard);
    }
    
    // Then set the specified card as default
    const card = this.paymentCards.get(cardId);
    if (!card) {
      throw new Error(`Payment card with ID ${cardId} not found`);
    }
    
    const updatedCard = { ...card, isDefault: true };
    this.paymentCards.set(cardId, updatedCard);
    return updatedCard;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async updatePropertyByAdmin(propertyId: number, data: AdminUpdateProperty): Promise<Property> {
    const property = await this.getProperty(propertyId);
    if (!property) {
      throw new Error(`Property with ID ${propertyId} not found`);
    }
    
    const updatedProperty = { 
      ...property, 
      ...data,
      updatedAt: new Date()
    };
    
    this.properties.set(propertyId, updatedProperty);
    return updatedProperty;
  }

  async updateUserByAdmin(userId: number, data: AdminUpdateUser): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = { ...user, ...data };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getAllTransactions(): Promise<WalletTransaction[]> {
    return Array.from(this.walletTransactions.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
  }
  
  // Property images operations
  async addPropertyImage(image: InsertPropertyImage): Promise<PropertyImage> {
    const id = this.propertyImageCurrentId++;
    const now = new Date();
    
    const propertyImage: PropertyImage = {
      ...image,
      id,
      createdAt: now,
      isPrimary: image.isPrimary || false,
      sortOrder: image.sortOrder || 0
    };
    
    this.propertyImages.set(id, propertyImage);
    return propertyImage;
  }
  
  async getPropertyImages(propertyId: number): Promise<PropertyImage[]> {
    return Array.from(this.propertyImages.values())
      .filter(image => image.propertyId === propertyId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  
  async deletePropertyImage(imageId: number): Promise<void> {
    const image = this.propertyImages.get(imageId);
    if (!image) {
      throw new Error(`Property image with ID ${imageId} not found`);
    }
    
    this.propertyImages.delete(imageId);
  }
  
  // Property document operations
  async addPropertyDocument(doc: InsertPropertyDocument): Promise<PropertyDocument> {
    const id = this.propertyDocumentCurrentId++;
    const now = new Date();
    
    const propertyDocument: PropertyDocument = {
      ...doc,
      id,
      uploadedAt: now
    };
    
    this.propertyDocuments.set(id, propertyDocument);
    return propertyDocument;
  }
  
  async getPropertyDocuments(propertyId: number): Promise<PropertyDocument[]> {
    return Array.from(this.propertyDocuments.values())
      .filter(doc => doc.propertyId === propertyId)
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }
  
  async deletePropertyDocument(docId: number): Promise<void> {
    const doc = this.propertyDocuments.get(docId);
    if (!doc) {
      throw new Error(`Property document with ID ${docId} not found`);
    }
    
    this.propertyDocuments.delete(docId);
  }
  
  // Admin audit logs
  async addAdminAuditLog(log: InsertAdminAuditLog): Promise<AdminAuditLog> {
    const id = this.adminAuditLogCurrentId++;
    const now = new Date();
    
    const adminAuditLog: AdminAuditLog = {
      ...log,
      id,
      timestamp: now,
      details: log.details || null,
      ipAddress: log.ipAddress || null
    };
    
    this.adminAuditLogs.set(id, adminAuditLog);
    return adminAuditLog;
  }
  
  async getAdminAuditLogs(): Promise<AdminAuditLog[]> {
    return Array.from(this.adminAuditLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export class DatabaseStorage implements IStorage {
  // Session store
  sessionStore: session.Store;

  constructor() {
    // Initialize session store
    this.sessionStore = new PostgresSessionStore({
      pool, 
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const userData = {
      ...insertUser,
      walletBalance: 0,
      fullName: insertUser.fullName || null,
      email: insertUser.email || null,
      phoneNumber: insertUser.phoneNumber || null,
      avatarUrl: null,
      role: insertUser.role || "user",
      isVerified: false,
      createdAt: now,
      lastLogin: null
    };
    
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async updateUserProfile(userId: number, profileData: UpdateUserProfile): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(profileData)
      .where(eq(users.id, userId))
      .returning();
      
    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return updatedUser;
  }
  
  // Property operations
  async getProperties(filter: string): Promise<Property[]> {
    return db.select().from(properties).where(eq(properties.filter, filter));
  }
  
  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }
  
  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const now = new Date();
    const propertyData = {
      ...insertProperty,
      createdAt: now,
      updatedAt: now,
      completionDate: null,
      description: insertProperty.description || null,
      floorArea: insertProperty.floorArea || null,
      yearBuilt: insertProperty.yearBuilt || null,
      parkingSpaces: insertProperty.parkingSpaces || null,
      monthlyRent: insertProperty.monthlyRent || null,
      serviceCharges: insertProperty.serviceCharges || null,
      maintenanceFees: insertProperty.maintenanceFees || null,
      occupancyRate: insertProperty.occupancyRate || null,
      adminId: insertProperty.adminId || null
    };
    
    const [property] = await db.insert(properties).values(propertyData).returning();
    return property;
  }
  
  async initializeProperties(): Promise<void> {
    // Check if properties already exist
    const existingProperties = await db.select().from(properties);
    if (existingProperties.length > 0) {
      return;
    }
    
    // Sample properties
    const sampleProperties: InsertProperty[] = [
      {
        title: "2 Bed in Golden Estate, Masaki",
        location: "Golden Estate",
        city: "Dar es Salaam",
        bedrooms: 2,
        price: "TZS 450,000,000",
        imageUrl: "https://images.unsplash.com/photo-1582407947304-fd6169a9d7e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        type: "Balanced",
        fundingPercentage: 80,
        yearlyReturn: 10.08,
        totalReturn: 50.42,
        projectedYield: 5.40,
        propertyId: "908",
        status: "Ready",
        filter: "Available"
      },
      {
        title: "1 Bed in Peninsula Apartments, Msasani",
        location: "Peninsula",
        city: "Dar es Salaam",
        bedrooms: 1,
        price: "TZS 380,000,000",
        imageUrl: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        type: "Balanced",
        fundingPercentage: 79,
        yearlyReturn: 9.71,
        totalReturn: 48.54,
        projectedYield: 5.16,
        propertyId: "2711",
        status: "Rented",
        filter: "Available"
      },
      {
        title: "Studio in Urban Residence, Upanga",
        location: "Urban Residence",
        city: "Dar es Salaam",
        bedrooms: 0,
        price: "TZS 250,000,000",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        type: "Capital Growth",
        fundingPercentage: 46,
        yearlyReturn: 9.70,
        totalReturn: 48.51,
        projectedYield: 5.32,
        propertyId: "4112",
        status: "Rented",
        filter: "Available"
      },
      {
        title: "3 Bed Villa, Mikocheni",
        location: "Mikocheni",
        city: "Dar es Salaam",
        bedrooms: 3,
        price: "TZS 650,000,000",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        type: "Capital Growth",
        fundingPercentage: 100,
        yearlyReturn: 8.50,
        totalReturn: 42.50,
        projectedYield: 4.20,
        propertyId: "5243",
        status: "Rented",
        filter: "Funded"
      },
      {
        title: "2 Bed in Regent Estate, Kinondoni",
        location: "Regent Estate",
        city: "Dar es Salaam",
        bedrooms: 2,
        price: "TZS 520,000,000",
        imageUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        type: "Balanced",
        fundingPercentage: 100,
        yearlyReturn: 10.20,
        totalReturn: 51.00,
        projectedYield: 5.50,
        propertyId: "3651",
        status: "Rented",
        filter: "Funded"
      },
      {
        title: "1 Bed in City Centre, Kivukoni",
        location: "City Centre",
        city: "Dar es Salaam",
        bedrooms: 1,
        price: "TZS 320,000,000",
        imageUrl: "https://images.unsplash.com/photo-1577495508326-19a1b3cf65b9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        type: "Balanced",
        fundingPercentage: 0,
        yearlyReturn: 9.80,
        totalReturn: 49.00,
        projectedYield: 5.10,
        propertyId: "7823",
        status: "Exited",
        filter: "Exited"
      }
    ];
    
    // Add properties to storage
    for (const property of sampleProperties) {
      await this.createProperty(property);
    }
  }
  
  // User-Property operations
  async getUserProperties(userId: number): Promise<(UserProperty & { property: Property })[]> {
    const userProps = await db
      .select()
      .from(userProperties)
      .where(eq(userProperties.userId, userId));
      
    const result = [];
    
    for (const up of userProps) {
      const [property] = await db
        .select()
        .from(properties)
        .where(eq(properties.id, up.propertyId));
        
      if (!property) {
        throw new Error(`Property with ID ${up.propertyId} not found`);
      }
      
      result.push({ ...up, property });
    }
    
    return result;
  }
  
  async addUserProperty(insertUserProperty: InsertUserProperty): Promise<UserProperty> {
    const userPropertyData = {
      ...insertUserProperty,
      status: insertUserProperty.status || "active"
    };
    
    const [userProperty] = await db
      .insert(userProperties)
      .values(userPropertyData)
      .returning();
      
    return userProperty;
  }
  
  // Wallet operations
  async getUserWalletBalance(userId: number): Promise<number> {
    const [user] = await db
      .select({ walletBalance: users.walletBalance })
      .from(users)
      .where(eq(users.id, userId));
      
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return user.walletBalance;
  }
  
  async updateWalletBalance(userId: number, amount: number): Promise<User> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
      
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({ walletBalance: user.walletBalance + amount })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }
  
  async addWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const transactionData = {
      ...transaction,
      method: transaction.method || "standard",
      organization: transaction.organization || "-",
      account: transaction.account || "-",
      relatedPropertyId: transaction.relatedPropertyId === undefined ? null : transaction.relatedPropertyId,
      date: new Date()
    };
    
    const [walletTransaction] = await db
      .insert(walletTransactions)
      .values(transactionData)
      .returning();
      
    return walletTransaction;
  }
  
  async getWalletTransactions(userId: number): Promise<WalletTransaction[]> {
    return db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.date));
  }
  
  // Payment Card operations
  async addPaymentCard(insertCard: InsertPaymentCard): Promise<PaymentCard> {
    // Extract last 4 digits from card number
    const lastFourDigits = insertCard.cardNumber.slice(-4);
    
    // Check if user has any cards already
    const userCards = await this.getUserPaymentCards(insertCard.userId);
    const isFirst = userCards.length === 0;
    
    const cardData = {
      ...insertCard,
      lastFourDigits,
      isDefault: isFirst
    };
    
    const [paymentCard] = await db
      .insert(paymentCards)
      .values(cardData)
      .returning();
      
    return paymentCard;
  }
  
  async getUserPaymentCards(userId: number): Promise<PaymentCard[]> {
    return db
      .select()
      .from(paymentCards)
      .where(eq(paymentCards.userId, userId));
  }
  
  async deletePaymentCard(cardId: number): Promise<void> {
    const [card] = await db
      .select()
      .from(paymentCards)
      .where(eq(paymentCards.id, cardId));
      
    if (!card) {
      throw new Error(`Payment card with ID ${cardId} not found`);
    }
    
    await db
      .delete(paymentCards)
      .where(eq(paymentCards.id, cardId));
    
    // If the deleted card was the default, set another card as default
    if (card.isDefault) {
      const userCards = await this.getUserPaymentCards(card.userId);
      if (userCards.length > 0) {
        await this.setDefaultPaymentCard(userCards[0].id, card.userId);
      }
    }
  }
  
  async setDefaultPaymentCard(cardId: number, userId: number): Promise<PaymentCard> {
    // First, set all user's cards to non-default
    await db
      .update(paymentCards)
      .set({ isDefault: false })
      .where(eq(paymentCards.userId, userId));
    
    // Then set the specified card as default
    const [updatedCard] = await db
      .update(paymentCards)
      .set({ isDefault: true })
      .where(eq(paymentCards.id, cardId))
      .returning();
      
    if (!updatedCard) {
      throw new Error(`Payment card with ID ${cardId} not found`);
    }
    
    return updatedCard;
  }
  
  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }
  
  async getAllProperties(): Promise<Property[]> {
    return db.select().from(properties);
  }
  
  async updatePropertyByAdmin(propertyId: number, data: AdminUpdateProperty): Promise<Property> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    const [updatedProperty] = await db
      .update(properties)
      .set(updateData)
      .where(eq(properties.id, propertyId))
      .returning();
      
    if (!updatedProperty) {
      throw new Error(`Property with ID ${propertyId} not found`);
    }
    
    return updatedProperty;
  }
  
  async updateUserByAdmin(userId: number, data: AdminUpdateUser): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
      
    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return updatedUser;
  }
  
  async getAllTransactions(): Promise<WalletTransaction[]> {
    return db
      .select()
      .from(walletTransactions)
      .orderBy(desc(walletTransactions.date));
  }
  
  // Property images operations
  async addPropertyImage(image: InsertPropertyImage): Promise<PropertyImage> {
    const imageData = {
      ...image,
      isPrimary: image.isPrimary || false,
      sortOrder: image.sortOrder || 0,
      createdAt: new Date()
    };
    
    const [propertyImage] = await db
      .insert(propertyImages)
      .values(imageData)
      .returning();
      
    return propertyImage;
  }
  
  async getPropertyImages(propertyId: number): Promise<PropertyImage[]> {
    return db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId))
      .orderBy(propertyImages.sortOrder);
  }
  
  async deletePropertyImage(imageId: number): Promise<void> {
    const [image] = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.id, imageId));
      
    if (!image) {
      throw new Error(`Property image with ID ${imageId} not found`);
    }
    
    await db
      .delete(propertyImages)
      .where(eq(propertyImages.id, imageId));
  }
  
  // Property document operations
  async addPropertyDocument(doc: InsertPropertyDocument): Promise<PropertyDocument> {
    const docData = {
      ...doc,
      uploadedAt: new Date()
    };
    
    const [propertyDocument] = await db
      .insert(propertyDocuments)
      .values(docData)
      .returning();
      
    return propertyDocument;
  }
  
  async getPropertyDocuments(propertyId: number): Promise<PropertyDocument[]> {
    return db
      .select()
      .from(propertyDocuments)
      .where(eq(propertyDocuments.propertyId, propertyId))
      .orderBy(desc(propertyDocuments.uploadedAt));
  }
  
  async deletePropertyDocument(docId: number): Promise<void> {
    const [doc] = await db
      .select()
      .from(propertyDocuments)
      .where(eq(propertyDocuments.id, docId));
      
    if (!doc) {
      throw new Error(`Property document with ID ${docId} not found`);
    }
    
    await db
      .delete(propertyDocuments)
      .where(eq(propertyDocuments.id, docId));
  }
  
  // Admin audit logs
  async addAdminAuditLog(log: InsertAdminAuditLog): Promise<AdminAuditLog> {
    const logData = {
      ...log,
      details: log.details || null,
      ipAddress: log.ipAddress || null,
      timestamp: new Date()
    };
    
    const [adminAuditLog] = await db
      .insert(adminAuditLogs)
      .values(logData)
      .returning();
      
    return adminAuditLog;
  }
  
  async getAdminAuditLogs(): Promise<AdminAuditLog[]> {
    return db
      .select()
      .from(adminAuditLogs)
      .orderBy(desc(adminAuditLogs.timestamp));
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
