import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  password = '';
  token = '';
  message = '';

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  async submit() {
    await this.auth.resetPassword(this.token, this.password);
    this.message = 'Password updated. You can now log in.';
    setTimeout(() => this.router.navigate(['/account']), 1500);
  }
}
