import { 
  users, type User, type InsertUser,
  properties, type Property, type InsertProperty,
  userProperties, type UserProperty, type InsertUserProperty,
  walletTransactions, type WalletTransaction, type InsertWalletTransaction,
  type UpdateUserProfile
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  // Storage
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private userProperties: Map<number, UserProperty>;
  private walletTransactions: Map<number, WalletTransaction>;
  
  // IDs
  private userCurrentId: number;
  private propertyCurrentId: number;
  private userPropertyCurrentId: number;
  private walletTransactionCurrentId: number;
  
  // Session store
  sessionStore: session.Store;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.properties = new Map();
    this.userProperties = new Map();
    this.walletTransactions = new Map();
    
    // Initialize IDs
    this.userCurrentId = 1;
    this.propertyCurrentId = 1;
    this.userPropertyCurrentId = 1;
    this.walletTransactionCurrentId = 1;
    
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
    const user: User = { 
      ...insertUser, 
      id,
      walletBalance: 0,
      fullName: null,
      email: null,
      phoneNumber: null,
      avatarUrl: null
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
    const property: Property = { ...insertProperty, id };
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
}

export const storage = new MemStorage();
