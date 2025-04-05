import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ADD_EMPLOYEE, UPDATE_EMPLOYEE } from '../../graphql.queries';
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
        });
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
        if (this.employeeForm.invalid) {
            return;
        }


        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/login'], {
                queryParams: { message: 'Please log in to add an employee.' },
            });
            return;
        }

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
            profileImage: null, 
        };

        this.authService
            .mutate<{ addEmployee: any }>(ADD_EMPLOYEE, variables)
            .subscribe({
                next: (response) => {
                    const employeeId = response.addEmployee.id;


                    if (this.profileImage instanceof File) {
                        const updateVariables = {
                            id: employeeId,
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
                            .mutateWithFile<{ updateEmployee: any }>(UPDATE_EMPLOYEE, updateVariables)
                            .subscribe({
                                next: (updateResponse) => {
                                    this.router.navigate(['/employees'], {
                                        queryParams: { message: 'Employee added and profile image uploaded successfully.' },
                                    });
                                },
                                error: (updateError) => {
                                    this.errorMessage = updateError.message;
                                    console.error('Error updating employee with profile image:', updateError);

                                    this.router.navigate(['/employees'], {
                                        queryParams: { message: 'Employee added, but failed to upload profile image.' },
                                    });
                                },
                            });
                    } else {

                        this.router.navigate(['/employees'], {
                            queryParams: { message: 'Employee added successfully.' },
                        });
                    }
                },
                error: (error) => {
                    this.errorMessage = error.message;
                    console.error('Error adding employee:', error);
                    if (error.message.includes('not authenticated')) {
                        this.router.navigate(['/login'], {
                            queryParams: { message: 'Please log in to add an employee.' },
                        });
                    }
                },
            });
    }
}