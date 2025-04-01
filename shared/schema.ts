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
  description: text("description").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  relatedPropertyId: integer("related_property_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type InsertUserProperty = z.infer<typeof insertUserPropertySchema>;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type InsertPaymentCard = z.infer<typeof insertPaymentCardSchema>;

export type User = typeof users.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type UserProperty = typeof userProperties.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type PaymentCard = typeof paymentCards.$inferSelect;
