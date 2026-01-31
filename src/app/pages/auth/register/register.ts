import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent {
  form: any = {};
  error = '';

  @Output() registered = new EventEmitter<void>();

  constructor(private auth: AuthService) {}

  async submit() {
    try {
      await this.auth.register(this.form);
      this.registered.emit();
    } catch {
      this.error = 'Registration failed';
    }
  }
}
