import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../services/cart';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop.html',
  styleUrls: ['./shop.scss'],
})
export class ShopComponent {

  constructor(public cartService: CartService) {}

  products: CartItem[] = [
    { name: 'Tsibah Alo T-Shirt', price: 25, image: '/assets/merch-tsibah-alo.png' },
    { name: 'Eritrean Flag Hoodie', price: 40, image: '/assets/merch-flag-hoodie.png' },
    { name: 'Tsibah Alo Hat', price: 18, image: '/assets/merch-tsibah-alo-hat.png' },
    { name: 'Cultural Tote Bag', price: 20, image: '/assets/merch-tote.png' },
    { name: 'New Album', price: 15, image: '/assets/album-cover.jpg' },
  ];

  addToCart(product: CartItem) {
    this.cartService.addToCart(product);
  }

  removeItem(index: number) {
    this.cartService.removeItem(index);
  }
}
