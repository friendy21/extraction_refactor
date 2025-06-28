// src/components/employees/add-employee-modal.tsx
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAddEmployee } from '@/hooks/api';
import { Employee } from '@/types';


interface AddEmployeeModalProps {
  onClose: () => void;
  onAdd: () => void;
}

export default function AddEmployeeModal({ onClose, onAdd }: AddEmployeeModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        position: '',
        location: '',
        workModel: '',
        age: '',
        gender: '',
        ethnicity: '',
        language: '',
        timezone: '',
        include: true,
        status: 'included' as 'included' | 'excluded'
      });

  const addEmployeeMutation = useAddEmployee();

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await addEmployeeMutation.mutateAsync({
            ...formData,
            status: formData.include ? 'included' : 'excluded'
        });
        onAdd();
        onClose();
    } catch (error) {
        console.error("Failed to add employee:", error)
    }
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="manual">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          </TabsList>
          <TabsContent value="manual" className="pt-4">
            <form onSubmit={handleManualSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
                  </div>
                </div>
              </div>
              
              {/* Work Information */}
              <div>
                <h3 className="text-lg font-medium mb-2">Work Information</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="department">Department</Label>
                        <Select onValueChange={(value) => handleSelectChange('department', value)}>
                            <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="engineering">Engineering</SelectItem>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="sales">Sales</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="position">Position</Label>
                        <Input id="position" value={formData.position} onChange={(e) => handleChange('position', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="location">Location</Label>
                         <Select onValueChange={(value) => handleSelectChange('location', value)}>
                            <SelectTrigger><SelectValue placeholder="Select a location" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sf">San Francisco</SelectItem>
                                <SelectItem value="ny">New York</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="workModel">Work Model</Label>
                        <Select onValueChange={(value) => handleSelectChange('workModel', value)}>
                            <SelectTrigger><SelectValue placeholder="Select a work model" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="remote">Remote</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
              </div>
              
               {/* Demographic Information */}
              <div>
                <h3 className="text-lg font-medium mb-2">Demographic Information</h3>
                 <p className="text-sm text-gray-500 mb-4">This information helps analyze workplace patterns. All data is anonymized.</p>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" value={formData.age} onChange={(e) => handleChange('age', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="gender">Gender</Label>
                        <Select onValueChange={(value) => handleSelectChange('gender', value)}>
                            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="ethnicity">Race/Ethnicity</Label>
                         <Select onValueChange={(value) => handleSelectChange('ethnicity', value)}>
                            <SelectTrigger><SelectValue placeholder="Select ethnicity" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asian">Asian</SelectItem>
                                <SelectItem value="black">Black</SelectItem>
                                <SelectItem value="hispanic">Hispanic</SelectItem>
                                <SelectItem value="white">White</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                        <Label htmlFor="language">Primary Language</Label>
                        <Input id="language" value={formData.language} onChange={(e) => handleChange('language', e.target.value)} placeholder="e.g., English, Spanish"/>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="timezone">Time Zone</Label>
                        <Select onValueChange={(value) => handleSelectChange('timezone', value)}>
                            <SelectTrigger><SelectValue placeholder="Select time zone" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pst">PST</SelectItem>
                                <SelectItem value="est">EST</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
              </div>
              
              {/* Analysis Inclusion */}
              <div>
                 <h3 className="text-lg font-medium mb-2">Analysis Inclusion</h3>
                 <div className="flex items-center space-x-2">
                    <Label htmlFor="include">Exclude</Label>
                    <Switch id="include" checked={formData.include} onCheckedChange={(checked) => handleChange('include', checked)} />
                    <Label htmlFor="include">Include</Label>
                 </div>
                 <p className="text-sm text-gray-500 mt-2">Choose whether to include this employee's data in the analysis.</p>
              </div>

              <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={addEmployeeMutation.isPending}>
                    {addEmployeeMutation.isPending ? 'Adding...' : 'Add Employee'}
                  </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="csv">
              <div className="py-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-gray-300 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="font-medium text-gray-600">Drag and drop your CSV file here</p>
                  <p className="text-sm text-gray-500">or</p>
                  <Button variant="outline" className="mt-2">Browse Files</Button>
              </div>
               <div className="mt-6">
                <h4 className="font-semibold">CSV Template Guide</h4>
                <p className="text-sm text-gray-500">Your CSV should have the following columns:</p>
                <code className="text-xs bg-gray-100 p-2 rounded block mt-2">
                    name,email,department,position,location,workModel,age,gender,ethnicity,timeZone,language,status
                </code>
                 <Button variant="outline" className="mt-4">Download Template</Button>
              </div>
               <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">
                    Upload CSV
                  </Button>
              </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}