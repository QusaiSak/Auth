import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError } from 'rxjs';
import { AuthService } from '../serv/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private router = inject(Router);
  AuthServices = inject(AuthService);
  errorMessage: string = '';

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ])
  });

  ngOnInit(): void {}

  // Getter methods for template access
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit() {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;

      this.AuthServices.pushLogin(email, password).subscribe({
        next: (res: any) => {
          this.errorMessage = '';
          localStorage.setItem('token', res.token);
          this.router.navigate(['']);
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Invalid email or password';
          console.error('Login failed:', error);
        }
      });
    }
  }
}
