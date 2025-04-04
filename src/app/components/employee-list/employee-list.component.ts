import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { GET_ALL_EMPLOYEES, FIND_EMPLOYEES_BY_POSITION_OR_DEPARTMENT, REMOVE_EMPLOYEE } from '../../graphql.queries';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
})
export class EmployeeListComponent implements OnInit {
  employees: any[] = [];
  displayedColumns: string[] = ['firstName', 'lastName', 'email', 'position', 'department', 'actions'];
  department: string = '';
  position: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.fetchEmployees();
  }

  fetchEmployees(): void {
    this.authService
      .query<{ getAllEmployees: any[] }>(GET_ALL_EMPLOYEES)
      .subscribe({
        next: (data) => {
          this.employees = data.getAllEmployees;
        },
        error: (error) => {
          console.error('Error fetching employees:', error);
        },
      });
  }

  searchEmployees(): void {
    this.authService
      .query<{ findEmployeesByPositionOrDepartment: any[] }>(FIND_EMPLOYEES_BY_POSITION_OR_DEPARTMENT, {
        position: this.position || null,
        department: this.department || null,
      })
      .subscribe({
        next: (data) => {
          this.employees = data.findEmployeesByPositionOrDepartment;
        },
        error: (error) => {
          console.error('Error searching employees:', error);
        },
      });
  }

  viewDetails(id: string): void {
    this.router.navigate([`/employee/${id}`]);
  }

  editEmployee(id: string): void {
    this.router.navigate([`/employee/update/${id}`]);
  }

  deleteEmployee(id: string): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.authService
        .mutate<{ removeEmployee: boolean }>(REMOVE_EMPLOYEE, { id })
        .subscribe({
          next: () => {
            this.fetchEmployees(); 
          },
          error: (error) => {
            console.error('Error deleting employee:', error);
          },
        });
    }
  }
}