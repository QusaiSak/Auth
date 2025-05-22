import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../serv/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  errorMessage: string = '';

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    ]),
    confirmPassword: new FormControl('', [
      Validators.required
    ])
  });

  // Getter methods for template access
  get email() { return this.forgotPasswordForm.get('email'); }
  get newPassword() { return this.forgotPasswordForm.get('newPassword'); }
  get confirmPassword() { return this.forgotPasswordForm.get('confirmPassword'); }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const { email, newPassword, confirmPassword } = this.forgotPasswordForm.value;

      if (newPassword !== confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        return;
      }

      this.authService.forgetPassword(email!, newPassword!, confirmPassword!).subscribe({
        next: (response: any) => {
          this.errorMessage = '';
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Password reset failed';
          console.error('Password reset failed:', error);
        }
      });
    }
  }
}
