import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  @Output() loggedIn = new EventEmitter<void>();

  constructor(private auth: AuthService) {}

  async submit() {
    try {
      await this.auth.login(this.email, this.password);
      this.loggedIn.emit();
    } catch {
      this.error = 'Invalid email or password';
    }
  }
}
