import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Running data collection...');
    
    // Simulate data collection
    await new Promise(resolve => setTimeout(resolve, 3000));

    return NextResponse.json({
      success: true,
      data: { processedCount: 242 },
    }, { status: 200 });
  } catch (error) {
    console.error('Data collection error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to collect data',
    }, { status: 500 });
  }
}