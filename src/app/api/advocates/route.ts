import { db } from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!db) {
      console.log("Database not available, returning static data");
      return NextResponse.json({ 
        data: advocateData,
        source: "static" 
      });
    }

    const data = await db.select().from(advocates);
    
    if (data.length === 0) {
      console.log("No data in database, returning static data");
      return NextResponse.json({ 
        data: advocateData,
        source: "static" 
      });
    }

    return NextResponse.json({ 
      data,
      source: "database" 
    });
  } catch (error) {
    console.error("Error fetching advocates:", error);
    
    return NextResponse.json({ 
      data: advocateData,
      source: "static",
      error: "Database unavailable, showing static data" 
    });
  }
}