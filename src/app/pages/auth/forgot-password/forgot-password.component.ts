import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  email = '';
  success = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    this.loading = true;
    this.success = '';

    await this.auth.forgotPassword(this.email);

    this.success =
      'If an account exists for this email, a password reset link has been sent.';

    this.loading = false;

    // ✅ Redirect after 3 seconds
    setTimeout(() => {
      this.router.navigate(['/account']);
    }, 3000);
  }
}
