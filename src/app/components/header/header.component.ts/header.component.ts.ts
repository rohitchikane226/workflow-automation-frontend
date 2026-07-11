import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.ts.html',
  styleUrls: ['./header.component.ts.scss']
})
export class HeaderComponent implements OnInit {

  isLoggedIn = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    // ✅ Check login on load
    this.isLoggedIn = this.auth.isLoggedIn();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  handleGetStarted() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth']);
    }
  }

  logout() {
    this.auth.logout();
    this.isLoggedIn = false; // ✅ update UI manually
  }
}