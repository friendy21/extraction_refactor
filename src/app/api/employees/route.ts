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
