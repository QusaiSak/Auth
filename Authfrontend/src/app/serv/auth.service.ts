import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../model/user.type';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http = inject(HttpClient)
  private baseUrl = 'http://localhost:5000';

  getProfile() {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  pushRegister(username: any, email: any, password: any , repassword: any) {
    return this.http.post(`${this.baseUrl}/user/register`, { username, email, password , repassword });
  }

  pushLogin(email: any, password: any) {
    return this.http.post(`${this.baseUrl}/user/login`, { email, password });
  }

  forgetPassword(email: string, newPassword: string, confirmPassword: string) {
    return this.http.post(`${this.baseUrl}/user/forgot-password`, {
      email,
      newPassword,
      confirmPassword
    });
  }

  updateProfile(userData: Partial<User>) {
    const token = localStorage.getItem('token');
    return this.http.put(`${this.baseUrl}/user/profile`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  deleteAccount() {
    const token = localStorage.getItem('token');
    return this.http.delete(`${this.baseUrl}/user/account`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }
}
