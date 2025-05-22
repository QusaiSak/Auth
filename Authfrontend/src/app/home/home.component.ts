import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../serv/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  username: string = '';
  isLoggedIn: boolean = false;

  ngOnInit() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedIn = true;
      this.authService.getProfile().subscribe({
        next: (response: any) => {
          this.username = response.username;
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.username = '';
    this.router.navigate(['/login']);
  }
}
