import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // ✅ REQUIRED for routerLink
  ],
  templateUrl: './order-details.html',
  styleUrls: ['./order-details.scss'],
})
export class OrderDetailsComponent implements OnInit {
  order: any = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const idParam = this.route.snapshot.paramMap.get('id');
      const id = Number(idParam);

      if (!id) {
        throw new Error('Invalid order id');
      }

      this.order = await this.auth.getOrderById(id);
    } catch (error) {
      this.error = 'Order not found.';
      this.order = null;
    } finally {
      this.loading = false;
    }
  }
}
