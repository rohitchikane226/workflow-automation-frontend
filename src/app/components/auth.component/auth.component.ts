import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {

  // toggle tab
  isLoginMode = true;

  // form data
  loginData = {
    email: '',
    password: ''
  };

  signupData = {
    email: '',
    password: ''
  };

  constructor(private auth: AuthService, private router: Router) {}

  // 🔐 LOGIN
  onLogin() {
    this.auth.login(this.loginData).subscribe({
      next: (res: any) => {
        if(res.data && res.data.token)
        this.auth.saveToken(res.data.token);
      localStorage.setItem('email', res.data.email);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        alert('Invalid credentials');
      }
    });
  }

  // 📝 SIGNUP
  onSignup() {
    this.auth.register(this.signupData).subscribe({
      next: () => {
        alert('Signup successful');

        // 👉 switch to login tab
        this.isLoginMode = true;
      },
      error: () => {
        alert('Signup failed');
      }
    });
  }
  switchMode(isLogin: boolean) {
    this.isLoginMode = isLogin;
  }
}