import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../service/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-drawer.component.html',
  styleUrls: ['./cart-drawer.component.scss'],
})
export class CartDrawerComponent {
  constructor(public cartService: CartService) {}
}
