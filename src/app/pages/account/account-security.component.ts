import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@service/auth.service';
import { LoginComponent } from '../auth/login/login.component';
import { RegisterComponent } from '../auth/register/register.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoginComponent,
    RegisterComponent,
  ],
  templateUrl: './account-security.component.html',
  styleUrls: ['./account-security.component.scss'],
})
export class AccountSecurityComponent implements OnInit {
  user: any = null;
  orders: any[] = [];
  loading = true;

  constructor(private auth: AuthService) {}

  async ngOnInit(): Promise<void> {
    await this.reloadAccount();
  }

  async reloadAccount(): Promise<void> {
    try {
      this.user = await this.auth.getMe();

      if (this.user) {
        this.orders = await this.auth.getMyOrders();
      } else {
        this.orders = [];
      }
    } catch {
      this.user = null;
      this.orders = [];
    } finally {
      this.loading = false;
    }
  }

  logout(): void {
    this.auth.logout();
    this.user = null;
    this.orders = [];
    this.loading = false;
  }
}
