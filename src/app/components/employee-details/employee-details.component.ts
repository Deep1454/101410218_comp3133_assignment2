import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FIND_EMPLOYEE_BY_ID } from '../../graphql.queries';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.css'],
})
export class EmployeeDetailsComponent implements OnInit {
  employee: any = null;
  backendUrl: string = 'http://localhost:2222'; 

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.authService
        .query<{ findEmployeeById: any }>(FIND_EMPLOYEE_BY_ID, { id })
        .subscribe({
          next: (data) => {
            this.employee = data.findEmployeeById;
          },
          error: (error) => {
            console.error('Error fetching employee details:', error);
          },
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }
}