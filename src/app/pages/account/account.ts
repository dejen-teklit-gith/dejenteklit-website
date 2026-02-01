import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { LoginComponent } from '../auth/login/login';
import { RegisterComponent } from '../auth/register/register';

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
    }
  }


  logout(): void {
    this.auth.logout();

    // 🔑 RESET STATE (NO PAGE RELOAD)
    this.user = null;
    this.orders = [];
    this.loading = false;
  }
}
