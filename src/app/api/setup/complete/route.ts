import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Completing setup...');
    
    // Simulate setup completion
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = {
      id: 'user-1',
      email: 'admin123@glynac.ai',
      name: 'Demo User',
      isFirstTimeUser: false, // No longer first time user
      setupCompleted: true,   // Setup is now completed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: user,
    }, { status: 200 });
  } catch (error) {
    console.error('Setup completion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to complete setup',
    }, { status: 500 });
  }
}