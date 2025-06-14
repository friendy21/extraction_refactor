'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SetupLayout from '@/components/setup/setup-layout';
import { useCompleteSetup, useGetOrganization, useGetEmployees } from '@/hooks/api';
import { useAuth } from '@/providers/auth-provider';

export default function ReviewSetupPage() {
  const [confirmations, setConfirmations] = useState({
    employeeNotification: false,
    organizationApproval: false,
    appropriateUse: false,
  });

  const router = useRouter();
  const { setUser } = useAuth();
  const { data: organizationData } = useGetOrganization();
  const { data: employeesData } = useGetEmployees();
  const completeSetupMutation = useCompleteSetup();

  const organization = organizationData?.data;
  const employees = employeesData?.data || [];
  const includedEmployees = employees.filter(emp => emp.status === 'included');

  const departmentStats = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleConfirmationChange = (key: keyof typeof confirmations) => {
    setConfirmations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const canComplete = Object.values(confirmations).every(Boolean);

  const handleCompleteSetup = async () => {
    if (!canComplete) return;

    try {
      const result = await completeSetupMutation.mutateAsync();
      
      if (result.success && result.data) {
        setUser(result.data);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to complete setup:', error);
    }
  };

  const handleBack = () => {
    router.push('/setup/anonymization');
  };

  return (
    <SetupLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Review & Confirmation</h1>
          <p className="text-lg text-gray-600">
            Review your setup and confirm to deploy to the Glynac analysis engine.
          </p>
        </div>

        {/* Setup Summary */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Setup Summary</h2>
          
          {/* Connected Data Sources */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Connected Data Sources</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Microsoft 365', connected: true },
                { name: 'Google Workspace', connected: true },
                { name: 'Slack', connected: true },
                { name: 'Zoom', connected: true }
              ].map((source) => (
                <div key={source.name} className="flex items-center p-3 bg-green-50 rounded-lg">
                  <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">{source.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Data */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Employee Data</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
                <div className="text-sm text-gray-600">Total Employees</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{includedEmployees.length}</div>
                <div className="text-sm text-gray-600">Included in Analysis</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{employees.length - includedEmployees.length}</div>
                <div className="text-sm text-gray-600">Excluded from Analysis</div>
              </div>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Department Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(departmentStats).map(([dept, count]) => (
                <div key={dept} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-900">{dept}</span>
                  <span className="text-gray-600">{count} employees</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Collection Summary */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Collection</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">78,432</div>
              <div className="text-sm text-gray-600">Emails</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">10,762</div>
              <div className="text-sm text-gray-600">Meetings</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">121,548</div>
              <div className="text-sm text-gray-600">Chat Messages</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">43,684</div>
              <div className="text-sm text-gray-600">File Accesses</div>
            </div>
          </div>
        </div>

        {/* Anonymization Status */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Anonymization</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-medium text-green-800">All PII successfully anonymized</div>
                <div className="text-sm text-green-700">
                  Employee names, email addresses, and other personal identifiers have been replaced with anonymous IDs to ensure privacy during analysis.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Usage Confirmation */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Usage Confirmation</h2>
          <p className="text-gray-600 mb-6">Please confirm the following statements before proceeding with analysis:</p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="employee-notification"
                checked={confirmations.employeeNotification}
                onChange={() => handleConfirmationChange('employeeNotification')}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="employee-notification" className="ml-3 text-sm text-gray-700">
                <span className="font-medium">Employee Notification</span>
                <br />
                I confirm that employees have been informed that their workplace communication data will be analyzed for improving collaboration and team dynamics.
              </label>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="organization-approval"
                checked={confirmations.organizationApproval}
                onChange={() => handleConfirmationChange('organizationApproval')}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="organization-approval" className="ml-3 text-sm text-gray-700">
                <span className="font-medium">Organization Approval</span>
                <br />
                I confirm that I have the necessary authorization from my organization to collect and analyze workplace communication data.
              </label>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="appropriate-use"
                checked={confirmations.appropriateUse}
                onChange={() => handleConfirmationChange('appropriateUse')}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="appropriate-use" className="ml-3 text-sm text-gray-700">
                <span className="font-medium">Appropriate Use</span>
                <br />
                I confirm that the analysis results will be used solely for the purpose of improving workplace collaboration, employee well-being, and organizational effectiveness.
              </label>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            ← Back
          </button>
          
          <button
            type="button"
            onClick={handleCompleteSetup}
            disabled={!canComplete || completeSetupMutation.isPending}
            className="px-8 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completeSetupMutation.isPending ? 'Completing Setup...' : 'Complete Setup & Launch Dashboard'}
          </button>
        </div>

        {completeSetupMutation.error && (
          <div className="mt-4 text-red-600 text-sm text-center">
            Failed to complete setup. Please try again.
          </div>
        )}
      </div>
    </SetupLayout>
  );
}