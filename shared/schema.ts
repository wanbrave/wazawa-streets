import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  phoneNumber: text("phone_number"),
  avatarUrl: text("avatar_url"),
  walletBalance: real("wallet_balance").default(0).notNull(),
  role: text("role").default("user").notNull(), // user, admin, manager
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export const paymentCards = pgTable("payment_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cardNumber: text("card_number").notNull(),
  cardholderName: text("cardholder_name").notNull(),
  expiryDate: text("expiry_date").notNull(),
  cardType: text("card_type").notNull(), // visa, mastercard, etc.
  isDefault: boolean("is_default").default(false).notNull(),
  lastFourDigits: text("last_four_digits").notNull(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  price: text("price").notNull(),
  imageUrl: text("image_url").notNull(),
  type: text("type").notNull(),
  fundingPercentage: integer("funding_percentage").notNull(),
  yearlyReturn: real("yearly_return").notNull(),
  totalReturn: real("total_return").notNull(),
  projectedYield: real("projected_yield").notNull(),
  propertyId: text("property_id").notNull(),
  status: text("status").notNull(),
  filter: text("filter").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completionDate: timestamp("completion_date"),
  description: text("description"),
  floorArea: integer("floor_area"),
  yearBuilt: integer("year_built"),
  parkingSpaces: integer("parking_spaces"),
  monthlyRent: real("monthly_rent"),
  serviceCharges: real("service_charges"),
  maintenanceFees: real("maintenance_fees"),
  occupancyRate: real("occupancy_rate"),
  adminId: integer("admin_id"), // Admin who created/manages this property
});

export const propertyImages = pgTable("property_images", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  imageUrl: text("image_url").notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull(),
  action: text("action").notNull(), // Created property, Updated user, etc.
  entityType: text("entity_type").notNull(), // User, Property, Transaction, etc.
  entityId: integer("entity_id").notNull(),
  details: text("details"), // JSON string with details
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const propertyDocuments = pgTable("property_documents", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  title: text("title").notNull(),
  documentUrl: text("document_url").notNull(),
  fileType: text("file_type").notNull(), // PDF, DOCX, etc.
  fileSize: integer("file_size").notNull(), // in KB
  uploadedBy: integer("uploaded_by").notNull(), // admin ID
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const userProperties = pgTable("user_properties", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  propertyId: integer("property_id").notNull(),
  investmentAmount: real("investment_amount").notNull(),
  dateInvested: text("date_invested").notNull(),
  shares: real("shares").notNull(),
  status: text("status").default("active").notNull(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(), // deposit, withdrawal, investment, return
  method: text("method").default("standard"), // card, mobile-money, bank, standard
  organization: text("organization").default("-"), // M-Pesa, Airtel-Money, CRDB, Visa, etc.
  account: text("account").default("-"), // Masked account info - last 4 digits or phone
  description: text("description").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  relatedPropertyId: integer("related_property_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  phoneNumber: true,
  role: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPropertySchema = createInsertSchema(userProperties).omit({
  id: true,
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  date: true,
});

export const updateUserProfileSchema = createInsertSchema(users).pick({
  fullName: true,
  email: true,
  phoneNumber: true,
  avatarUrl: true,
}).partial();

export const insertPaymentCardSchema = createInsertSchema(paymentCards).omit({
  id: true,
  lastFourDigits: true,
});

export const insertPropertyImageSchema = createInsertSchema(propertyImages).omit({
  id: true,
  createdAt: true,
});

export const insertPropertyDocumentSchema = createInsertSchema(propertyDocuments).omit({
  id: true,
  uploadedAt: true,
});

export const insertAdminAuditLogSchema = createInsertSchema(adminAuditLogs).omit({
  id: true,
  timestamp: true,
});

// Admin schemas
export const adminUpdateUserSchema = createInsertSchema(users).omit({
  id: true,
  password: true,
}).partial();

export const adminUpdatePropertySchema = createInsertSchema(properties).omit({
  id: true,
}).partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type InsertUserProperty = z.infer<typeof insertUserPropertySchema>;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type InsertPaymentCard = z.infer<typeof insertPaymentCardSchema>;
export type InsertPropertyImage = z.infer<typeof insertPropertyImageSchema>;
export type InsertPropertyDocument = z.infer<typeof insertPropertyDocumentSchema>;
export type InsertAdminAuditLog = z.infer<typeof insertAdminAuditLogSchema>;
export type AdminUpdateUser = z.infer<typeof adminUpdateUserSchema>;
export type AdminUpdateProperty = z.infer<typeof adminUpdatePropertySchema>;

export type User = typeof users.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type UserProperty = typeof userProperties.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type PaymentCard = typeof paymentCards.$inferSelect;
export type PropertyImage = typeof propertyImages.$inferSelect;
export type PropertyDocument = typeof propertyDocuments.$inferSelect;
export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
