import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const orgData = await request.json();

    console.log('Creating organization:', orgData.name);

    // Mock organization creation
    const organization = {
      id: 'org-' + Date.now(),
      ...orgData,
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      data: organization,
    }, { status: 201 });
  } catch (error) {
    console.error('Organization creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create organization',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const organization = {
      id: 'org-1',
      name: 'Demo Organization',
      country: 'US',
      state: 'California',
      industry: 'technology',
      size: '51-200',
    };

    return NextResponse.json({
      success: true,
      data: organization,
    }, { status: 200 });
  } catch (error) {
    console.error('Organization fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch organization',
    }, { status: 500 });
  }
}