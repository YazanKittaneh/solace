import db from "..";
import { advocates } from "../schema";
import { advocateData } from "./advocates";

async function seed() {
  try {
    if (!db) {
      console.error("❌ Database connection not available. Please ensure DATABASE_URL is set.");
      process.exit(1);
    }
    
    console.log("🌱 Starting database seed...");
    
    // Clear existing data
    await db.delete(advocates);
    console.log("✅ Cleared existing advocates");
    
    // Insert new data
    const insertedAdvocates = await db.insert(advocates).values(
      advocateData.map(advocate => ({
        firstName: advocate.firstName,
        lastName: advocate.lastName,
        city: advocate.city,
        degree: advocate.degree,
        payload: advocate.specialties,
        yearsOfExperience: advocate.yearsOfExperience,
        phoneNumber: advocate.phoneNumber,
      }))
    ).returning();
    
    console.log(`✅ Inserted ${insertedAdvocates.length} advocates`);
    console.log("🎉 Database seeding completed!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();