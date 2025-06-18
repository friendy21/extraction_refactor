// app/setup/employees/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SetupLayout from '@/components/setup/setup-layout';
import { useGetEmployees, useRunEmployeeDiscovery, useUpdateEmployee, useAddEmployee } from '@/hooks/api';
import { Employee } from '@/types';
import AddEmployeeModal from '@/components/employees/add-employee-modal';

export default function EmployeesSetupPage() {
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [discoveryHasBeenRun, setDiscoveryHasBeenRun] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 10;
  
  const router = useRouter();
  const { data: employeesData, isLoading, refetch } = useGetEmployees();
  const runDiscoveryMutation = useRunEmployeeDiscovery();
  const updateEmployeeMutation = useUpdateEmployee();
  const addEmployeeMutation = useAddEmployee();

  const employees = employeesData?.data || [];
  const hasEmployees = employees.length > 0;

  const handleRunDiscovery = async () => {
    try {
      await runDiscoveryMutation.mutateAsync();
      setDiscoveryHasBeenRun(true);
      refetch();
    } catch (error) {
      console.error('Failed to run discovery:', error);
    }
  };

  const handleStatusChange = async (employeeId: string, status: 'included' | 'excluded') => {
    try {
      await updateEmployeeMutation.mutateAsync({
        id: employeeId,
        updates: { status }
      });
      refetch();
    } catch (error) {
      console.error('Failed to update employee:', error);
    }
  };

  const handleAddEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      await addEmployeeMutation.mutateAsync(employeeData);
      refetch();
      setShowAddEmployee(false);
    } catch (error) {
      console.error('Failed to add employee:', error);
      throw error;
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All Departments' || employee.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'All Status' || employee.status === selectedStatus.toLowerCase();
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const startIndex = (currentPage - 1) * employeesPerPage;
  const endIndex = startIndex + employeesPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment, selectedStatus]);

  const departments = Array.from(new Set(employees.map(emp => emp.department)));
  const stats = {
    total: employees.length,
    departments: departments.length,
    locations: Array.from(new Set(employees.map(emp => emp.location))).length,
    remote: employees.filter(emp => emp.location === 'Remote').length,
  };

  const departmentStats = departments.map(dept => ({
    name: dept,
    count: employees.filter(emp => emp.department === dept).length,
    percentage: Math.round((employees.filter(emp => emp.department === dept).length / employees.length) * 100)
  }));

  const handleContinue = () => {
    router.push('/setup/data');
  };

  const handleBack = () => {
    router.push('/setup/connection');
  };

  if (isLoading) {
    return (
      <SetupLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </SetupLayout>
    );
  }

  return (
    <SetupLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Employee Discovery</h1>
          <p className="text-lg text-gray-700 font-medium">
            Discover and manage employee data from your connected platforms.
          </p>
        </div>

        {/* Discovery Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Discover Employees</h2>
              <p className="text-gray-700 font-medium">Automatically detect and import employees from connected platforms.</p>
            </div>
            <button
              onClick={handleRunDiscovery}
              disabled={runDiscoveryMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {runDiscoveryMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running Discovery...
                </>
              ) : (
                'Run Discovery'
              )}
            </button>
          </div>

          {/* Success Message - Only show after discovery completes */}
          {discoveryHasBeenRun && hasEmployees && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-800 font-medium">
                  Discovery complete! Found {employees.length} employees.
                </span>
              </div>
            </div>
          )}

          {/* Error Message - Show if discovery was run but no employees found */}
          {discoveryHasBeenRun && !hasEmployees && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-800 font-medium">
                  No employees found. Make sure you have connected your data sources properly.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Only show the following sections AFTER discovery has been run AND employees are found */}
        {discoveryHasBeenRun && hasEmployees && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
                <div className="text-gray-800 font-semibold">Total Employees</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.departments}</div>
                <div className="text-gray-800 font-semibold">Departments</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.locations}</div>
                <div className="text-gray-800 font-semibold">Locations</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.remote}</div>
                <div className="text-gray-800 font-semibold">Remote Workers</div>
              </div>
            </div>

            {/* Department Distribution */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Department Distribution</h3>
              <div className="space-y-4">
                {departmentStats.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                      <span className="font-semibold text-gray-900">{dept.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-800 font-medium">{dept.count} employees</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${dept.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700 w-8 font-medium">{dept.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employee List */}
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Manage Employee List</h3>
                  <button
                    onClick={() => setShowAddEmployee(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center font-semibold"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Employee
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Search by name, email, position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All Departments">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All Status">All Status</option>
                    <option value="Included">Included</option>
                    <option value="Excluded">Excluded</option>
                  </select>
                </div>
              </div>

              {/* Employee Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-semibold text-gray-900">{employee.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {employee.department}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            employee.status === 'included' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleStatusChange(
                              employee.id, 
                              employee.status === 'included' ? 'excluded' : 'included'
                            )}
                            disabled={updateEmployeeMutation.isPending}
                            className={`${
                              employee.status === 'included'
                                ? 'text-red-700 hover:text-red-900'
                                : 'text-green-700 hover:text-green-900'
                            } disabled:opacity-50 font-semibold`}
                          >
                            {employee.status === 'included' ? 'Exclude' : 'Include'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-800 font-semibold">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} employees
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                          // Show first page, last page, current page, and pages around current page
                          const showPage = pageNum === 1 || 
                                          pageNum === totalPages || 
                                          Math.abs(pageNum - currentPage) <= 1;
                          
                          // Show ellipsis
                          const showEllipsis = (pageNum === 2 && currentPage > 4) || 
                                              (pageNum === totalPages - 1 && currentPage < totalPages - 3);

                          if (!showPage && !showEllipsis) return null;

                          if (showEllipsis) {
                            return (
                              <span key={`ellipsis-${pageNum}`} className="px-2 py-2 text-sm text-gray-600 font-medium">
                                ...
                              </span>
                            );
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-2 text-sm font-semibold rounded-md ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-800 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Add Employee Modal */}
        {showAddEmployee && (
          <AddEmployeeModal
            onClose={() => setShowAddEmployee(false)}
            onAdd={handleAddEmployee}
            isLoading={addEmployeeMutation.isPending}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
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