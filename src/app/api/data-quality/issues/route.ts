import { NextResponse } from 'next/server';

const mockIssues = [
  {
    id: 'issue-1',
    type: 'email_alias',
    employeeId: 'emp-1',
    employeeName: 'Sarah Williams',
    description: 'Employee has multiple email addresses across different systems. Consolidating these aliases ensures accurate communication analysis and prevents data fragmentation.',
    severity: 'medium',
    resolved: false,
  },
  {
    id: 'issue-2',
    type: 'data_conflict',
    employeeId: 'emp-2',
    employeeName: 'James Miller',
    description: 'Conflicting employee information detected between connected data sources.',
    severity: 'high',
    resolved: false,
  },
  {
    id: 'issue-3',
    type: 'email_alias',
    employeeId: 'emp-3',
    employeeName: 'Emily Rodriguez',
    description: 'Multiple email addresses found for this employee.',
    severity: 'medium',
    resolved: false,
  },
  {
    id: 'issue-4',
    type: 'missing_data',
    employeeId: 'emp-4',
    employeeName: 'John Smith',
    description: 'Employee has incomplete information in the system.',
    severity: 'low',
    resolved: false,
  },
];

export async function GET() {
  try {
    console.log('Fetching data quality issues');
    
    return NextResponse.json({
      success: true,
      data: mockIssues,
    }, { status: 200 });
  } catch (error) {
    console.error('Data quality issues fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch issues',
    }, { status: 500 });
  }
}