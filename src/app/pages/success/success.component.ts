import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
})
export class SuccessComponent implements OnInit {

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // ✅ Clear cart after successful payment
    this.cartService.clearCart();
  }
}
