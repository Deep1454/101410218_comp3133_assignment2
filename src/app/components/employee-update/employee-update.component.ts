import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FIND_EMPLOYEE_BY_ID, UPDATE_EMPLOYEE } from '../../graphql.queries';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-employee-update',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './employee-update.component.html',
  styleUrls: ['./employee-update.component.css'],
})
export class EmployeeUpdateComponent implements OnInit {
  employeeForm: FormGroup;
  errorMessage: string | null = null;
  profileImage: File | null = null;
  employeeId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {
    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      position: ['', Validators.required],
      salary: ['', [Validators.required, Validators.min(1000)]],
      joinDate: ['', Validators.required],
      department: ['', Validators.required],
      profileImage: [null],
    });
  }

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.authService
        .query<{ findEmployeeById: any }>(FIND_EMPLOYEE_BY_ID, { id: this.employeeId })
        .subscribe({
          next: (data) => {
            const employee = data.findEmployeeById;
            this.employeeForm.patchValue({
              firstName: employee.firstName,
              lastName: employee.lastName,
              email: employee.email,
              gender: employee.gender,
              position: employee.position,
              salary: employee.salary,
              joinDate: employee.joinDate.split('T')[0], 
              department: employee.department,
            });
          },
          error: (error) => {
            console.error('Error fetching employee for update:', error);
          },
        });
    }
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.profileImage = event.target.files[0];
    }
  }

  onSubmit(): void {
    if (this.employeeForm.invalid || !this.employeeId) return;

    const { firstName, lastName, email, gender, position, salary, joinDate, department } = this.employeeForm.value;

    const variables = {
      id: this.employeeId,
      firstName,
      lastName,
      email,
      gender,
      position,
      salary: parseFloat(salary),
      joinDate,
      department,
      profileImage: this.profileImage,
    };

    this.authService
      .mutateWithFile<{ updateEmployee: any }>(UPDATE_EMPLOYEE, variables)
      .subscribe({
        next: () => {
          this.router.navigate(['/employees']);
        },
        error: (error) => {
          this.errorMessage = error.message;
        },
      });
  }
}