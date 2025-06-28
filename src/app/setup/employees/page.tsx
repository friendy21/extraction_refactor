// src/app/setup/employees/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SetupLayout from '@/components/setup/setup-layout';
import AddEmployeeModal from '@/components/employees/add-employee-modal';
import EmployeeDetailsModal from '@/components/employees/employee-details-modal';
import { useGetEmployees, useRunEmployeeDiscovery } from '@/hooks/api';
import { Employee } from '@/types';

export default function ManageEmployeesPage() {
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data: employeesData, isLoading, refetch } = useGetEmployees();
  const runDiscoveryMutation = useRunEmployeeDiscovery();
  const router = useRouter();

  const employees = employeesData?.data || [];
  
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
        const matchesSearch = searchTerm === '' || 
                              employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              employee.position.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = departmentFilter === 'all' || employee.department === departmentFilter;
        const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;

        return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchTerm, departmentFilter, statusFilter]);

  const hasEmployees = employees.length > 0;

  const handleRunDiscovery = async () => {
    try {
      await runDiscoveryMutation.mutateAsync();
      refetch();
    } catch (error) {
      console.error('Failed to run discovery:', error);
    }
  };
  
  const handleContinue = () => {
    router.push('/setup/data');
  };

  const handleBack = () => {
    router.push('/setup/connection');
  };

  const handleAddEmployee = () => {
    refetch();
  }


  if (isLoading && !hasEmployees) {
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
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {!hasEmployees ? (
            <div className="text-center bg-white p-12 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Employees Found</h2>
              <p className="text-gray-600 mb-6">Run employee discovery to get started or add employees manually.</p>
              <Button onClick={handleRunDiscovery} disabled={runDiscoveryMutation.isPending}>
                {runDiscoveryMutation.isPending ? 'Running Discovery...' : 'Run Employee Discovery'}
              </Button>
            </div>
          ) : (
            <>
              <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Employee List</h1>
                <div className="flex items-center space-x-4">
                  <Button variant="outline">Manage All</Button>
                  <Button onClick={() => setShowAddEmployee(true)}>+ Add Employee</Button>
                </div>
              </header>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between mb-4">
                  <Input 
                    placeholder="Search by name, email, position..." 
                    className="max-w-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="flex space-x-4">
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="included">Included</SelectItem>
                        <SelectItem value="excluded">Excluded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell className="font-medium flex items-center">
                           <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={`/avatars/${employee.id}.png`} alt={employee.name} />
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {employee.name}
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>
                          <Badge variant={employee.status === 'included' ? 'secondary' : 'destructive'}>
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="link" onClick={() => setSelectedEmployee(employee)}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-500">
                        Showing 1 to {filteredEmployees.length} of {filteredEmployees.length} entries
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">Previous</Button>
                        <Button variant="outline" size="sm">Next</Button>
                    </div>
                </div>
              </div>
            </>
          )}
          
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack}>
                ← Back
            </Button>
            
            <Button onClick={handleContinue} >
                Continue →
            </Button>
        </div>
        </div>

        {showAddEmployee && (
          <AddEmployeeModal
            onClose={() => setShowAddEmployee(false)}
            onAdd={handleAddEmployee}
          />
        )}

        {selectedEmployee && (
          <EmployeeDetailsModal
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
          />
        )}
      </div>
    </SetupLayout>
  );
}