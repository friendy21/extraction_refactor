// app/setup/data/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SetupLayout from '@/components/setup/setup-layout';
import { useRunDataCollection, useGetDataQualityIssues, useResolveDataIssue, useGetEmployees } from '@/hooks/api';

export default function DataSetupPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'issues'>('overview');
  const [dataCollectionHasBeenRun, setDataCollectionHasBeenRun] = useState(false);
  
  const router = useRouter();
  const { data: employeesData } = useGetEmployees();
  const { data: issuesData, refetch: refetchIssues } = useGetDataQualityIssues();
  const runDataCollectionMutation = useRunDataCollection();
  const resolveIssueMutation = useResolveDataIssue();

  const employees = employeesData?.data || [];
  const issues = issuesData?.data || [];

  const handleRunDataCollection = async () => {
    try {
      await runDataCollectionMutation.mutateAsync();
      setDataCollectionHasBeenRun(true);
      refetchIssues();
    } catch (error) {
      console.error('Failed to run data collection:', error);
    }
  };

  const handleResolveIssue = async (issueId: string, resolution: any = {}) => {
    try {
      await resolveIssueMutation.mutateAsync({ issueId, resolution });
      refetchIssues();
    } catch (error) {
      console.error('Failed to resolve issue:', error);
    }
  };

  const handleContinue = () => {
    router.push('/setup/anonymization');
  };

  const handleBack = () => {
    router.push('/setup/employees');
  };

  const issuesByType = {
    email_alias: issues.filter(issue => issue.type === 'email_alias'),
    data_conflict: issues.filter(issue => issue.type === 'data_conflict'),
    missing_data: issues.filter(issue => issue.type === 'missing_data'),
  };

  const hasDataCollection = employees.some(emp => emp.emailCount || emp.chatCount || emp.meetingCount);
  const includedEmployees = employees.filter(emp => emp.status === 'included');

  return (
    <SetupLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Data Collection & Quality</h1>
          <p className="text-lg text-gray-700 font-medium">
            Collect and review data for all employees before analysis.
          </p>
        </div>

        {/* Data Collection Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Collect Data</h2>
              <p className="text-gray-700 font-medium">Run data collection to gather communication information for all employees.</p>
            </div>
            <button
              onClick={handleRunDataCollection}
              disabled={runDataCollectionMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold"
            >
              {runDataCollectionMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Collecting Data...
                </>
              ) : (
                'Run Data Collection'
              )}
            </button>
          </div>

          {/* Success Message - Only show after data collection completes */}
          {dataCollectionHasBeenRun && hasDataCollection && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-800 font-medium">
                  Data collection complete! Information gathered for {includedEmployees.length} employees.
                </span>
              </div>
            </div>
          )}

          {/* Error Message - Show if data collection was run but no data found */}
          {dataCollectionHasBeenRun && !hasDataCollection && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-800 font-medium">
                  No data collected. Please check your data source connections and try again.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Only show the following sections AFTER data collection has been run AND data exists */}
        {dataCollectionHasBeenRun && hasDataCollection && (
          <>
            {/* Employee Data Table */}
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Employee Data Overview</h3>
                <div className="flex items-center text-sm text-gray-700 font-medium mt-1">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {issues.length} issues detected
                  {issues.filter(issue => issue.type === 'email_alias').length > 0 && (
                    <button className="ml-4 text-blue-600 hover:text-blue-500 font-semibold">
                      ⚡ Merge All Emails
                    </button>
                  )}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Email Count</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Chat Count</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Meeting Count</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">File Access</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {includedEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-semibold text-gray-900">{employee.name}</div>
                              {issues.some(issue => issue.employeeId === employee.id) && (
                                <div className="text-xs text-yellow-600 font-medium">⚠ Issue</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee.emailCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee.chatCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee.meetingCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee.fileAccessCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Included
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-700 hover:text-blue-900 font-semibold">
                            👁 View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Data Quality Issues */}
            {issues.length > 0 && (
              <div className="bg-white shadow rounded-lg mb-8">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Data Quality Issues</h3>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-semibold">
                      ⚡ Auto-Fix All Issues
                    </button>
                  </div>
                  <p className="text-gray-700 font-medium mt-1">Review and resolve data issues before proceeding with your analysis</p>
                </div>

                {/* Issue Categories */}
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{issuesByType.email_alias.length}</div>
                      <div className="text-sm text-gray-700 font-semibold">Email Aliases</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{issuesByType.data_conflict.length}</div>
                      <div className="text-sm text-gray-700 font-semibold">Data Source Conflicts</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{issuesByType.missing_data.length}</div>
                      <div className="text-sm text-gray-700 font-semibold">Missing Data</div>
                    </div>
                  </div>

                  {/* Issues List */}
                  <div className="space-y-4">
                    {issues.slice(0, 5).map((issue) => (
                      <div key={issue.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                {issue.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{issue.employeeName}</div>
                                <div className="text-sm text-gray-700 font-medium">{issue.type.replace('_', ' ').toUpperCase()}</div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 font-medium">{issue.description}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleResolveIssue(issue.id)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 font-semibold"
                            >
                              {issue.type === 'email_alias' ? 'Merge Emails' : 'Resolve'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {issues.length > 5 && (
                    <div className="text-center mt-4">
                      <button className="text-blue-600 hover:text-blue-500 font-semibold">
                        View all {issues.length} issues
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Data Quality Summary</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm font-semibold text-yellow-800 mb-2">Email Aliases</div>
                  <div className="text-2xl font-bold text-yellow-600">{issuesByType.email_alias.length}</div>
                  <div className="text-xs text-yellow-700 font-medium">employees with multiple emails</div>
                  <button className="mt-2 text-xs text-yellow-700 hover:text-yellow-800 font-semibold">Review</button>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm font-semibold text-orange-800 mb-2">Source Conflicts</div>
                  <div className="text-2xl font-bold text-orange-600">{issuesByType.data_conflict.length}</div>
                  <div className="text-xs text-orange-700 font-medium">employees with conflicting data</div>
                  <button className="mt-2 text-xs text-orange-700 hover:text-orange-800 font-semibold">Review</button>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-sm font-semibold text-red-800 mb-2">Missing Data</div>
                  <div className="text-2xl font-bold text-red-600">{issuesByType.missing_data.length}</div>
                  <div className="text-xs text-red-700 font-medium">employees with incomplete information</div>
                  <button className="mt-2 text-xs text-red-700 hover:text-red-800 font-semibold">Review</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            ← Back
          </button>
          
          <button
            type="button"
            onClick={handleContinue}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Continue →
          </button>
        </div>
      </div>
    </SetupLayout>
  );
}