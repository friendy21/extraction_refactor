// app/api/organization/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const country = formData.get('country') as string;
    const state = formData.get('state') as string;
    const industry = formData.get('industry') as string;
    const size = formData.get('size') as string;
    const logoFile = formData.get('logo') as File | null;

    console.log('Creating organization:', name);

    // Validate required fields
    if (!name || !country || !state || !industry || !size) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        details: {
          name: !name ? 'Organization name is required' : null,
          country: !country ? 'Country is required' : null,
          state: !state ? 'State is required' : null,
          industry: !industry ? 'Industry is required' : null,
          size: !size ? 'Organization size is required' : null,
        }
      }, { status: 400 });
    }

    let logoUrl = null;

    // Handle logo file upload
    if (logoFile) {
      console.log('Processing logo upload:', logoFile.name);
      
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(logoFile.type)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid file type. Please upload PNG, JPG, or GIF files only.',
        }, { status: 400 });
      }

      // Validate file size (5MB max)
      if (logoFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({
          success: false,
          error: 'File size too large. Please upload files smaller than 5MB.',
        }, { status: 400 });
      }

      try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'logos');
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const fileExtension = logoFile.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExtension}`;
        const filePath = join(uploadsDir, fileName);

        // Convert file to buffer and save
        const bytes = await logoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        logoUrl = `/uploads/logos/${fileName}`;
        console.log('Logo saved to:', logoUrl);
      } catch (fileError) {
        console.error('File upload error:', fileError);
        return NextResponse.json({
          success: false,
          error: 'Failed to upload logo file',
        }, { status: 500 });
      }
    }

    // Mock organization creation
    const organization = {
      id: 'org-' + Date.now(),
      name,
      country,
      state,
      industry,
      size,
      logo: logoUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      data: organization,
      message: 'Organization created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Organization creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create organization. Please try again.',
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
      logo: '/uploads/logos/demo-logo.png',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
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

export async function PATCH(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const updates: any = {};
    const logoFile = formData.get('logo') as File | null;

    // Extract form fields
    for (const [key, value] of formData.entries()) {
      if (key !== 'logo' && value) {
        updates[key] = value;
      }
    }

    console.log('Updating organization with:', updates);

    // Handle logo update
    if (logoFile) {
      // Same file upload logic as POST
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(logoFile.type)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid file type',
        }, { status: 400 });
      }

      if (logoFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({
          success: false,
          error: 'File size too large',
        }, { status: 400 });
      }

      try {
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'logos');
        await mkdir(uploadsDir, { recursive: true });

        const fileExtension = logoFile.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExtension}`;
        const filePath = join(uploadsDir, fileName);

        const bytes = await logoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        updates.logo = `/uploads/logos/${fileName}`;
      } catch (fileError) {
        console.error('Logo update error:', fileError);
        return NextResponse.json({
          success: false,
          error: 'Failed to upload new logo',
        }, { status: 500 });
      }
    }

    const updatedOrganization = {
      id: 'org-1',
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      data: updatedOrganization,
      message: 'Organization updated successfully',
    }, { status: 200 });

  } catch (error) {
    console.error('Organization update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update organization',
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}