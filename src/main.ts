import { Routes } from '@angular/router';
import { LoginComponent } from './app/components/login/login.component';
import { SignupComponent } from './app/components/signup/signup.component';
import { EmployeeListComponent } from './app/components/employee-list/employee-list.component';
import { EmployeeAddComponent } from './app/components/employee-add/employee-add.component';
import { EmployeeDetailsComponent } from './app/components/employee-details/employee-details.component';
import { EmployeeUpdateComponent } from './app/components/employee-update/employee-update.component';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'employees', component: EmployeeListComponent },
  { path: 'employee/add', component: EmployeeAddComponent },
  { path: 'employee/:id', component: EmployeeDetailsComponent },
  { path: 'employee/update/:id', component: EmployeeUpdateComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];