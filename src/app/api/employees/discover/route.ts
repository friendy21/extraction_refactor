import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Running employee discovery...');
    
    // Simulate discovery process
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({
      success: true,
      data: { count: 248 },
    }, { status: 200 });
  } catch (error) {
    console.error('Discovery error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to run discovery',
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
