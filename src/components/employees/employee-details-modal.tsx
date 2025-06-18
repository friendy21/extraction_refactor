// components/employees/employee-details-modal.tsx
'use client';

import React from 'react';
import { Employee } from '@/types';

interface EmployeeDetailsModalProps {
  employee: Employee;
  onClose: () => void;
}

export default function EmployeeDetailsModal({ employee, onClose }: EmployeeDetailsModalProps) {
  const activityData = [
    { label: 'Emails Sent/Received', value: employee.emailCount || 0, icon: '📧', color: 'bg-blue-100 text-blue-800' },
    { label: 'Chat Messages', value: employee.chatCount || 0, icon: '💬', color: 'bg-green-100 text-green-800' },
    { label: 'Meetings Attended', value: employee.meetingCount || 0, icon: '📅', color: 'bg-purple-100 text-purple-800' },
    { label: 'Files Accessed', value: employee.fileAccessCount || 0, icon: '📁', color: 'bg-orange-100 text-orange-800' },
  ];

  const totalActivity = activityData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Employee Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Employee Profile */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-700">
                {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-xl font-bold text-gray-900">{employee.name}</h3>
                <p className="text-gray-700 font-medium">{employee.position}</p>
                <p className="text-gray-600 font-medium">{employee.email}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  employee.status === 'included' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {employee.status === 'included' ? 'Included' : 'Excluded'}
                </span>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3">Department</h4>
              <div className="bg-blue-50 rounded-lg p-3">
                <span className="inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                  {employee.department}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3">Location</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-sm font-semibold text-gray-800">
                  📍 {employee.location}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Overview */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Communication Activity</h4>
            <div className="grid grid-cols-2 gap-4">
              {activityData.map((activity, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-lg mr-2">{activity.icon}</span>
                        <span className="text-sm font-semibold text-gray-800">{activity.label}</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{activity.value.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-blue-800">Total Activity Score</h4>
                <p className="text-xs text-blue-700 font-medium">Combined communication and collaboration metrics</p>
              </div>
              <div className="text-2xl font-bold text-blue-600">{totalActivity.toLocaleString()}</div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-3">Discovered From</h4>
            <div className="flex flex-wrap gap-2">
              {(employee as any).discoveredFrom?.map((source: string, index: number) => (
                <span key={index} className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  {source}
                </span>
              )) || (
                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  Manual Entry
                </span>
              )}
            </div>
          </div>

          {/* Recent Activity Breakdown */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-3">Activity Breakdown</h4>
            <div className="space-y-3">
              {activityData.map((activity, index) => {
                const percentage = totalActivity > 0 ? Math.round((activity.value / totalActivity) * 100) : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="text-sm mr-2">{activity.icon}</span>
                      <span className="text-sm font-semibold text-gray-800 flex-1">{activity.label}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-12 text-right">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end pt-6 mt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}