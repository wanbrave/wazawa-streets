import { 
  users, type User, type InsertUser,
  properties, type Property, type InsertProperty,
  userProperties, type UserProperty, type InsertUserProperty
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
  
  // Property operations
  getProperties(filter: string): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  initializeProperties(): Promise<void>;
  
  // User-Property operations
  getUserProperties(userId: number): Promise<(UserProperty & { property: Property })[]>;
  addUserProperty(userProperty: InsertUserProperty): Promise<UserProperty>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  // Storage
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private userProperties: Map<number, UserProperty>;
  
  // IDs
  private userCurrentId: number;
  private propertyCurrentId: number;
  private userPropertyCurrentId: number;
  
  // Session store
  sessionStore: session.SessionStore;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.properties = new Map();
    this.userProperties = new Map();
    
    // Initialize IDs
    this.userCurrentId = 1;
    this.propertyCurrentId = 1;
    this.userPropertyCurrentId = 1;
    
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
        title: "2 Bed in Princess Tower, Dubai Marina",
        location: "Princess Tower",
        city: "Dubai",
        bedrooms: 2,
        price: "AED 1,823,000",
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
        title: "1 Bed in Sky Gardens, DIFC",
        location: "Sky Gardens",
        city: "Dubai",
        bedrooms: 1,
        price: "AED 1,867,000",
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
        title: "Studio in Hartland Greens, MBR City",
        location: "Hartland Greens",
        city: "Dubai",
        bedrooms: 0,
        price: "AED 1,010,000",
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
        title: "3 Bed Townhouse, The Villa",
        location: "The Villa",
        city: "Dubai",
        bedrooms: 3,
        price: "AED 2,650,000",
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
        title: "2 Bed in JBR, Dubai Marina",
        location: "JBR",
        city: "Dubai",
        bedrooms: 2,
        price: "AED 2,100,000",
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
        title: "1 Bed in Downtown, Burj Khalifa",
        location: "Downtown",
        city: "Dubai",
        bedrooms: 1,
        price: "AED 1,950,000",
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
    const userProperty: UserProperty = { ...insertUserProperty, id };
    this.userProperties.set(id, userProperty);
    return userProperty;
  }
}

export const storage = new MemStorage();
