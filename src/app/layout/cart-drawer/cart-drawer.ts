import {effect, Input} from '@angular/core';
import { Component} from '@angular/core';
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

  @Input() checkout!: () => void
  constructor(public cartService: CartService) {

    effect(() => {
      if (this.cartService.isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    });
  }
}
