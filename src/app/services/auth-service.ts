// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment}  from './../../enviroment/enviroment.prod'

@Injectable({ providedIn: 'root' })
export class AuthService {

   //private baseUrl = 'http://localhost:8081';
   private baseUrl = environment.apiBase;
  constructor(private http: HttpClient, private router: Router) {}

  login(data: any) {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  register(data: any) {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/auth']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string {
    const token = this.getToken();
    if (!token) return '';

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || 'USER';
  }
  getUsername() {
  return localStorage.getItem('username');
}
}