import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ADD_EMPLOYEE } from '../../graphql.queries';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.css'],
})
export class EmployeeAddComponent {
  employeeForm: FormGroup;
  errorMessage: string | null = null;
  profileImage: File | null = null;

  constructor(
    private fb: FormBuilder,
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

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.profileImage = event.target.files[0];
    }
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) return;

    const { firstName, lastName, email, gender, position, salary, joinDate, department } = this.employeeForm.value;

    const variables = {
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
      .mutateWithFile<{ addEmployee: any }>(ADD_EMPLOYEE, variables)
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