// src/components/employees/employee-details-modal.tsx
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Employee } from '@/types';

interface EmployeeDetailsModalProps {
  employee: Employee;
  onClose: () => void;
}

export default function EmployeeDetailsModal({ employee, onClose }: EmployeeDetailsModalProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>
        <div className="py-4">
            <div className="flex items-center space-x-4 mb-4">
                 <Avatar className="h-16 w-16">
                    <AvatarImage src={`/avatars/${employee.id}.png`} alt={employee.name} />
                    <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-lg font-bold">{employee.name}</h3>
                    <p className="text-sm text-gray-500">{employee.position}</p>
                    <p className="text-sm text-gray-500">{employee.email}</p>
                </div>
            </div>
            
             <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="font-semibold">Department</p>
                    <p>{employee.department}</p>
                </div>
                 <div>
                    <p className="font-semibold">Location</p>
                    <p>{employee.location}</p>
                </div>
                 <div>
                    <p className="font-semibold">Status</p>
                     <Badge variant={employee.status === 'included' ? 'secondary' : 'destructive'}>
                        {employee.status}
                     </Badge>
                </div>
            </div>

        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}