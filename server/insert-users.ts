
import { db } from "./db";
import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function insertDefaultUsers() {
  try {
    // Insert admin user
    const adminUser = await storage.createUser({
      username: "admin",
      password: await hashPassword("admin123"),
      role: "admin",
      fullName: "System Admin",
      email: "admin@example.com",
      phoneNumber: "123456789"
    });
    console.log("Admin user created:", adminUser);

    // Insert client user
    const clientUser = await storage.createUser({
      username: "client",
      password: await hashPassword("client123"),
      role: "user",
      fullName: "Demo Client",
      email: "client@example.com",
      phoneNumber: "987654321"
    });
    console.log("Client user created:", clientUser);

  } catch (error) {
    console.error("Error inserting users:", error);
  } finally {
    await db.end();
  }
}

insertDefaultUsers();
