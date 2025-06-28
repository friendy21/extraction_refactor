
// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    console.log('Token verification attempt');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'No token provided',
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Mock token verification - replace with real JWT verification
    if (token && token.startsWith('mock-jwt-token-')) {
      const user = {
        id: 'user-1',
        email: 'admin123@glynac.ai',
        name: 'Demo User',
        isFirstTimeUser: true,
        setupCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        data: user,
      }, { status: 200 });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid token',
    }, { status: 401 });
  } catch (error) {
    console.error('Token verification error:', error);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
