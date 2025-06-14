import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Fetching dashboard stats');
    
    const stats = {
      totalEmployees: 248,
      departments: 8,
      locations: 12,
      remoteWorkers: 53,
      dataCollection: {
        emails: 78432,
        meetings: 10762,
        chatMessages: 121548,
        fileAccesses: 43684,
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
    }, { status: 200 });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard stats',
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}