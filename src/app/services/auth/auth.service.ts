import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private url = 'http://localhost:2222/graphql';
    private token: string | null = null;

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        if (isPlatformBrowser(this.platformId)) {
            const storedToken = localStorage.getItem('token');
            this.token = storedToken ? storedToken : null;
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

    query = <T>(query: string, variables?: any): Observable<T> => {
        return this.request('query', query, variables);
    }

    mutate = <T>(mutation: string, variables?: any): Observable<T> => {
        return this.request('mutation', mutation, variables);
    }

    mutateWithFile = <T>(mutation: string, variables: any): Observable<T> => {
      if (!this.isAuthenticated()) {
          return throwError(() => new Error('User is not authenticated. Please log in.'));
      }
  
      const formData = new FormData();
      const operations: any = {
          query: mutation,
          variables: {},
      };
  
      const fileMap: { [key: string]: string[] } = {};
      const files: { key: string; file: File }[] = [];
      let fileIndex = 0;
  
      for (const key in variables) {
          if (variables[key] instanceof File) {
              const fileKey = `${fileIndex}`;
              files.push({ key: fileKey, file: variables[key] });
              fileMap[fileKey] = [`variables.${key}`];
              operations.variables[key] = null;
              fileIndex++;
          } else {
              operations.variables[key] = variables[key];
          }
      }
  
      files.forEach(({ key, file }) => {
          formData.append(key, file); 
      });
  
      formData.append('operations', JSON.stringify(operations));
      formData.append('map', JSON.stringify(fileMap));
  
      const headers = this.token ? new HttpHeaders({ Authorization: `Bearer ${this.token}` }) : new HttpHeaders();
  
      const requestUrl = this.url ?? 'http://localhost:2222/graphql'; 
  
      return this.http.post<{ data: T; errors?: any[] }>(requestUrl, formData, { headers }).pipe(
          map((response) => {
              if (response.errors) {
                  throw new Error(response.errors.map((err) => err.message).join(', '));
              }
              return response.data;
          }),
          catchError((error) => {
              return throwError(() => new Error(error.message || 'An error occurred while executing the GraphQL request'));
          })
      );
  };

    private request = <T>(operationType: 'query' | 'mutation', operation: string, variables?: any): Observable<T> => {
        if (operation.includes('signup') || operation.includes('login')) {
        } else if (!this.isAuthenticated()) {
            return throwError(() => new Error('User is not authenticated. Please log in.'));
        }

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        });

        const body = {
            query: operation,
            variables: variables || null,
        };

        const requestUrl = this.url ?? 'http://localhost:2222/graphql';
        if (!requestUrl) {
            throw new Error('GraphQL URL is undefined in request method. Ensure the AuthService is properly instantiated.');
        }

        return this.http.post<{ data: T; errors?: any[] }>(requestUrl, body, { headers }).pipe(
            map((response: { data: T; errors?: any[] }) => {
                if (response.errors) {
                    throw new Error(response.errors.map((err) => err.message).join(', '));
                }
                return response.data;
            }),
            catchError((error: any) => {
                return throwError(() => new Error(error.message || 'An error occurred while executing the GraphQL request'));
            })
        );
    }
}
