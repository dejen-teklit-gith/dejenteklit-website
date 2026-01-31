import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth';
import { LoginComponent } from '../auth/login/login';
import { RegisterComponent } from '../auth/register/register';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoginComponent,
    RegisterComponent,
  ],
  templateUrl: './account.html',
  styleUrls: ['./account.scss'],
})
export class AccountComponent implements OnInit {
  user: any = null;
  orders: any[] = [];
  loading = false;

  constructor(private auth: AuthService) {}

  async ngOnInit() {
    // logged out => show forms instantly
    if (!this.auth.getToken()) {
      this.user = null;
      this.loading = false;
      return;
    }

    // ✅ instant: show stored user immediately (no loading flash)
    this.user = this.auth.getUser();
    this.loading = false;

    // 🔄 background refresh
    try {
      const fresh = await this.auth.getMe();
      if (fresh) {
        this.user = fresh;
        this.orders = await this.auth.getMyOrders();
      }
    } catch {
      this.user = null;
      this.orders = [];
    }
  }


  // 🔄 Called after login / register
  async reloadAccount() {
    this.loading = true;

    try {
      // ⚡ instant UX: trust stored user first
      this.user = this.auth.getUser();

      // 🔒 then sync with backend
      const freshUser = await this.auth.getMe();
      if (freshUser) {
        this.user = freshUser;
        this.orders = await this.auth.getMyOrders();
      }
    } catch (error) {
      console.error('Reload account failed:', error);
      this.user = null;
    } finally {
      this.loading = false;
    }
  }

  logout(): void {
    this.auth.logout();
    this.user = null;
    this.orders = [];
  }
}
