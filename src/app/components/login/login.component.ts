import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { LOGIN } from '../../graphql.queries';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        RouterLink
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    errorMessage: string | null = null;
    infoMessage: string | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            if (params['message']) {
                this.infoMessage = params['message'];
            }
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            return;
        }

        const { email, password } = this.loginForm.value;

        this.authService
            .mutate<{ login: { token: string } }>(LOGIN, { email, password })
            .subscribe({
                next: (response) => {
                    if (response && response.login && response.login.token) {
                        const token = response.login.token;
                        this.authService.setToken(token);
                        this.router.navigate(['/employees']);
                    } else {
                        this.errorMessage = 'Login failed: No token returned';
                        console.error('No token in login response');
                    }
                },
                error: (error) => {
                    this.errorMessage = error.message;
                    console.error('Login Error:', error);
                },
            });
    }
}