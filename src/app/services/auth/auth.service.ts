import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly url = 'http://localhost:2222/graphql'; 
  private token: string | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object 
  ) {

    if (isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string): void {
    this.token = token;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  logout(): void {
    this.token = null;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
  }

  clearToken(): void {
    this.logout();
  }


  query<T>(query: string, variables?: any): Observable<T> {
    return this.request<T>('query', query, variables);
  }


  mutate<T>(mutation: string, variables?: any): Observable<T> {
    return this.request<T>('mutation', mutation, variables);
  }


  mutateWithFile<T>(mutation: string, variables: any): Observable<T> {
    const formData = new FormData();


    interface Operations {
      query: string;
      variables: { [key: string]: any };
    }


    const operations: Operations = {
      query: mutation,
      variables: {},
    };


    const fileMap: { [key: string]: string[] } = {};
    let fileIndex = 0;


    for (const key in variables) {
      if (variables[key] instanceof File) {
        const fileKey = `${fileIndex}`;
        formData.append(fileKey, variables[key]);
        fileMap[fileKey] = [`variables.${key}`];
        operations.variables[key] = null;
        fileIndex++;
      } else {
        operations.variables[key] = variables[key];
      }
    }


    formData.append('operations', JSON.stringify(operations));
    formData.append('map', JSON.stringify(fileMap));


    const headers = this.token ? new HttpHeaders({ Authorization: `Bearer ${this.token}` }) : undefined;


    interface GraphQLError {
      message: string;
      locations?: { line: number; column: number }[];
      path?: string[];
    }

    return this.http.post<{ data: T; errors?: GraphQLError[] }>(this.url, formData, { headers }).pipe(
      map((response: { data: T; errors?: GraphQLError[] }) => {
        if (response.errors) {
          throw new Error(response.errors.map((err: GraphQLError) => err.message).join(', '));
        }
        return response.data;
      }),
      catchError((error: any) => {
        return throwError(() => new Error(error.message || 'An error occurred while executing the GraphQL request'));
      })
    );
  }


  private request<T>(operationType: 'query' | 'mutation', operation: string, variables?: any): Observable<T> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    });


    const body = {
      query: operation,
      variables: variables || null,
    };


    interface GraphQLError {
      message: string;
      locations?: { line: number; column: number }[];
      path?: string[];
    }


    return this.http.post<{ data: T; errors?: GraphQLError[] }>(this.url, body, { headers }).pipe(
      map((response: { data: T; errors?: GraphQLError[] }) => {

        if (response.errors) {
          throw new Error(response.errors.map((err: GraphQLError) => err.message).join(', '));
        }
        return response.data;
      }),
      catchError((error: any) => {

        return throwError(() => new Error(error.message || 'An error occurred while executing the GraphQL request'));
      })
    );
  }
}