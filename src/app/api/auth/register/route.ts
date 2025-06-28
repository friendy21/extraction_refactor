// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    console.log('Register attempt:', { email, name });

    // Mock registration - replace with real registration logic
    const user = {
      id: 'user-' + Date.now(),
      email,
      name: name || 'New User',
      isFirstTimeUser: true,
      setupCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const token = 'mock-jwt-token-' + Date.now();

    return NextResponse.json({
      success: true,
      data: { user, token },
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
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



