import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
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
