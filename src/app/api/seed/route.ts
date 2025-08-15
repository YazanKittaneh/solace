import { db } from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 }
      );
    }

    await db.delete(advocates);
    
    const records = await db.insert(advocates).values(advocateData).returning();

    return NextResponse.json({ 
      advocates: records,
      message: `Successfully seeded ${records.length} advocates` 
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to seed database",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}