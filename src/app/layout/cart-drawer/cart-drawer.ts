import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-drawer.html',
  styleUrls: ['./cart-drawer.scss'],
})
export class CartDrawerComponent {
  constructor(public cartService: CartService) {}
}
