import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@service/auth.service';

@Component({
  selector: 'app-account-orders',
  standalone: true,
  imports: [
    CommonModule,   // *ngIf, *ngFor
    RouterModule    // routerLink
  ],
  templateUrl: './account-orders.component.html',
  styleUrls: ['./account-orders.component.scss'],
})
export class AccountOrdersComponent implements OnInit {
  orders: any[] = []; // ✅ NEVER undefined

  constructor(private auth: AuthService) {}

  async ngOnInit(): Promise<void> {
    this.orders = await this.auth.getMyOrders();
  }
}
