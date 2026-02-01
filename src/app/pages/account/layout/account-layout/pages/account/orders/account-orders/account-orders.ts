import {AuthService} from '../../../../../../../../services/auth';
import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
@Component({
  selector: 'app-account-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-orders.html',
  styleUrls: ['./account-orders.scss'],
})

export class AccountOrdersComponent  implements OnInit {
  orders: any[] = [];
  loading = true;

  constructor(private auth: AuthService) {}

  async ngOnInit() {
    try {
      this.orders = await this.auth.getMyOrders();
    } finally {
      this.loading = false;
    }
  }
}
