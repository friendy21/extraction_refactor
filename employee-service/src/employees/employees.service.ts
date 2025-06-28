import { Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeesService {
  // 1. A private array to act as our "database"
  private readonly employees: Employee[] = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', position: 'Software Engineer' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', position: 'Project Manager' },
  ];

  // 2. A method to find all employees
  findAll(): Employee[] {
    return this.employees;
  }

  // 3. A method to create a new employee
  create(createEmployeeDto: CreateEmployeeDto): Employee {
    const newEmployee: Employee = {
      id: Date.now(), // Simple way to generate a unique ID for this example
      ...createEmployeeDto,
    };
    this.employees.push(newEmployee);
    return newEmployee;
  }
}