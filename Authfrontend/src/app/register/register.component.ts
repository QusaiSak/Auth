import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../serv/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private router = inject(Router);
  AuthServices = inject(AuthService);
  errorMessage: string = '';

  registerForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    ]),
    repassword: new FormControl('', [
      Validators.required
    ])
  });

  // Getter methods for template access
  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get repassword() { return this.registerForm.get('repassword'); }

  onSubmit() {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;

      if (formData.password !== formData.repassword) {
        this.errorMessage = 'Passwords do not match';
        return;
      }

      this.AuthServices.pushRegister(formData.username,formData.email,formData.password , formData.repassword).subscribe({
        next: (res: any) => {
          this.errorMessage = '';
          localStorage.setItem('token', res.token);
          this.router.navigate(['']);
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Registration failed';
          console.error('Registration failed:', error);
        }
      });
    }
  }
}
