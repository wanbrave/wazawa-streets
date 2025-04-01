import { pgTable, text, serial, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type InsertUserProperty = z.infer<typeof insertUserPropertySchema>;

export type User = typeof users.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type UserProperty = typeof userProperties.$inferSelect;
