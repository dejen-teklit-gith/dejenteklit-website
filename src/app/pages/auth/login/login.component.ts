import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  @Output() loggedIn = new EventEmitter<void>();

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async submit(): Promise<void> {
    // 🛑 Frontend validation
    if (!this.email || !this.password) {
      this.error = 'Email and password are required';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.auth.login(this.email, this.password);

      // 🔔 notify parent (AccountComponent)
      this.loggedIn.emit();

      // ✅ OPTION 1: redirect to dashboard
      this.router.navigate(['/account/app']);

    } catch (err) {
      this.error = 'Invalid email or password';
    } finally {
      this.loading = false;
    }
  }

  clearError(): void {
    this.error = '';
  }
}
