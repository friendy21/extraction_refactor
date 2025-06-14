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

// app/api/employees/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Mock employees data
const mockEmployees = [
  {
    id: 'emp-1',
    name: 'Jane Cooper',
    email: 'jane.cooper@example.com',
    department: 'Marketing',
    position: 'Marketing Director',
    location: 'New York',
    status: 'included',
    emailCount: 640,
    chatCount: 472,
    meetingCount: 71,
    fileAccessCount: 219,
  },
  {
    id: 'emp-2',
    name: 'John Smith',
    email: 'john.smith@example.com',
    department: 'Engineering',
    position: 'Software Engineer',
    location: 'San Francisco',
    status: 'included',
    emailCount: 1040,
    chatCount: 392,
    meetingCount: 131,
    fileAccessCount: 259,
  },
  {
    id: 'emp-3',
    name: 'David Kim',
    email: 'david.kim@example.com',
    department: 'Finance',
    position: 'Finance Director',
    location: 'London',
    status: 'included',
    emailCount: 820,
    chatCount: 245,
    meetingCount: 89,
    fileAccessCount: 187,
  },
  {
    id: 'emp-4',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    department: 'Product',
    position: 'Product Manager',
    location: 'Remote',
    status: 'excluded',
    emailCount: 950,
    chatCount: 567,
    meetingCount: 112,
    fileAccessCount: 334,
  },
  {
    id: 'emp-5',
    name: 'Alex Thompson',
    email: 'alex.thompson@company.com',
    department: 'Engineering',
    position: 'DevOps Engineer',
    location: 'Austin',
    status: 'included',
    emailCount: 1340,
    chatCount: 832,
    meetingCount: 51,
    fileAccessCount: 339,
  },
];

// Generate more mock employees (up to 248 total)
const departments = ['Engineering', 'Sales', 'Marketing', 'Finance', 'Product', 'HR', 'Customer Support', 'Legal'];
const locations = ['Remote', 'New York', 'San Francisco', 'London', 'Austin', 'Seattle', 'Boston', 'Toronto'];

for (let i = 6; i <= 248; i++) {
  mockEmployees.push({
    id: `emp-${i}`,
    name: `Employee ${i}`,
    email: `employee${i}@example.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    position: 'Team Member',
    location: locations[Math.floor(Math.random() * locations.length)],
    status: Math.random() > 0.1 ? 'included' : 'excluded',
    emailCount: Math.floor(Math.random() * 2000) + 100,
    chatCount: Math.floor(Math.random() * 1000) + 50,
    meetingCount: Math.floor(Math.random() * 200) + 10,
    fileAccessCount: Math.floor(Math.random() * 500) + 50,
  });
}

export async function GET() {
  try {
    console.log('Fetching employees list');
    
    return NextResponse.json({
      success: true,
      data: mockEmployees,
    }, { status: 200 });
  } catch (error) {
    console.error('Employees fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch employees',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const employeeData = await request.json();
    
    console.log('Adding new employee:', employeeData.name);
    
    const newEmployee = {
      id: 'emp-' + Date.now(),
      ...employeeData,
      status: 'included',
    };

    mockEmployees.push(newEmployee);

    return NextResponse.json({
      success: true,
      data: newEmployee,
    }, { status: 201 });
  } catch (error) {
    console.error('Employee creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create employee',
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// app/api/employees/discover/route.ts
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

// app/api/employees/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    
    console.log('Updating employee:', params.id, updates);
    
    // Mock update logic
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      data: { id: params.id, ...updates },
    }, { status: 200 });
  } catch (error) {
    console.error('Employee update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update employee',
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// app/api/setup/complete/route.ts
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

// app/api/dashboard/stats/route.ts
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