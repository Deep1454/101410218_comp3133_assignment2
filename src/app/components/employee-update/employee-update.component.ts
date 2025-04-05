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
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-employee-update',
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
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/login'], {
                queryParams: { message: 'Please log in to update an employee.' },
            });
            return;
        }

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
                        this.errorMessage = error.message;
                        console.error('Error fetching employee for update:', error);
                        if (error.message.includes('not authenticated')) {
                            this.router.navigate(['/login'], {
                                queryParams: { message: 'Please log in to update an employee.' },
                            });
                        }
                    },
                });
        }
    }

    onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.profileImage = input.files[0];
        } else {
            this.profileImage = null;
        }
    }
    onSubmit(): void {
      if (this.employeeForm.invalid || !this.employeeId) {
          return;
      }
  
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
          profileImage: this.profileImage || null,  
      };
  
  

      if (this.profileImage instanceof File) {
          this.authService.mutateWithFile<{ updateEmployee: any }>(UPDATE_EMPLOYEE, variables).subscribe({
              next: (response) => {
                  this.router.navigate(['/employees'], {
                      queryParams: { message: 'Employee updated successfully.' },
                  });
              },
              error: (error) => {
                  this.errorMessage = error.message;
                  console.error('Error updating employee with file:', error);
                  if (error.message.includes('not authenticated')) {
                      this.router.navigate(['/login'], {
                          queryParams: { message: 'Please log in to update an employee.' },
                      });
                  }
              },
          });
      } else {
          this.authService.mutate<{ updateEmployee: any }>(UPDATE_EMPLOYEE, variables).subscribe({
              next: (response) => {
                  this.router.navigate(['/employees'], {
                      queryParams: { message: 'Employee updated successfully.' },
                  });
              },
              error: (error) => {
                  this.errorMessage = error.message;
                  console.error('Error updating employee without file:', error);
                  if (error.message.includes('not authenticated')) {
                      this.router.navigate(['/login'], {
                          queryParams: { message: 'Please log in to update an employee.' },
                      });
                  }
              },
          });
      }
  }
  
}
