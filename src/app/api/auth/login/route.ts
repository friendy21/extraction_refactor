import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('Login attempt:', { email });

    // Mock authentication - replace with real auth logic
    if (email === 'admin123@glynac.ai' && password === 'admin123') {
      const user = {
        id: 'user-1',
        email,
        name: 'Demo User',
        isFirstTimeUser: true,
        setupCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const token = 'mock-jwt-token-' + Date.now();

      return NextResponse.json({
        success: true,
        data: { user, token },
      }, { status: 200 });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid credentials',
    }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}