import { NextResponse } from 'next/server';
import { seedLargeDataset } from '@/db/seed/large-seed';

export async function POST(request: Request) {
  try {
    // Parse the request body for optional count parameter
    let count = 10000;
    
    try {
      const body = await request.json();
      if (body.count && typeof body.count === 'number') {
        count = Math.min(Math.max(body.count, 1), 100000); // Limit between 1 and 100,000
      }
    } catch {
      // Use default count if body parsing fails
    }

    console.log(`Starting large seed with ${count} advocates...`);
    
    // Run the seed function
    const result = await seedLargeDataset(count);
    
    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${result.count} advocates`,
      count: result.count
    }, { status: 200 });
    
  } catch (error) {
    console.error('Large seed API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to seed large dataset',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Optional: GET endpoint to check if seeding is available
export async function GET() {
  return NextResponse.json({
    message: 'Large seed endpoint is available',
    usage: 'POST to this endpoint with optional JSON body: { "count": 10000 }',
    defaults: {
      count: 10000,
      minCount: 1,
      maxCount: 100000
    }
  });
}