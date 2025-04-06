import { bootstrapApplication } from '@angular/platform-browser';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/components/login/login.component';
import { SignupComponent } from './app/components/signup/signup.component';
import { EmployeeListComponent } from './app/components/employee-list/employee-list.component';
import { EmployeeDetailsComponent } from './app/components/employee-details/employee-details.component';
import { EmployeeAddComponent } from './app/components/employee-add/employee-add.component';
import { EmployeeUpdateComponent } from './app/components/employee-update/employee-update.component';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      { path: '', redirectTo: '/login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'employees', component: EmployeeListComponent },
      {
        path: 'employee/:id',
        component: EmployeeDetailsComponent,
        data: { renderMode: 'ssr' },
      },
      { path: 'employee/add', component: EmployeeAddComponent },
      { path: 'employee/update/:id', component: EmployeeUpdateComponent },
      { path: '**', redirectTo: '/login' },
    ]),
    provideHttpClient(),
    provideAnimations(),
  ],
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
