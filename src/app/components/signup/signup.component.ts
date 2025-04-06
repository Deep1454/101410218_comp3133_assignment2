import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { SIGNUP } from '../../graphql.queries';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        RouterLink
    ],
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
    signupForm: FormGroup;
    errorMessage: string | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.signupForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            gender: ['', Validators.required],
        });
    }

    onSubmit(): void {
        if (this.signupForm.invalid) {
            return;
        }

        const { firstName, lastName, email, password } = this.signupForm.value;


        this.authService
            .mutate<{ signup: { token: string } }>(SIGNUP, { firstName, lastName, email, password })
            .subscribe({
                next: (response) => {
                    const token = response.signup.token;
                    this.authService.setToken(token);
                    this.router.navigate(['/employees']);
                },
                error: (error) => {
                    this.errorMessage = error.message;
                    console.error('Signup Error:', error);
                    if (error.message.includes('not authenticated')) {
                        this.router.navigate(['/login'], {
                            queryParams: { message: 'Please log in after signing up.' },
                        });
                    }
                },
            });
    }
}