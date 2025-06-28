import { Controller, Get, Post, Body } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Employee } from './entities/employee.entity';

// 1. Define the base path for all routes in this controller
@Controller('api/v2/data/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // 2. Create the endpoint for GET /api/v2/data/employees
  @Get()
  findAll(): Employee[] {
    return this.employeesService.findAll();
  }

  // 3. Create the endpoint for POST /api/v2/data/employees
  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto): Employee {
    return this.employeesService.create(createEmployeeDto);
  }
}