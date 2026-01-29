import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';
import { firstValueFrom } from 'rxjs';
import { AppComponent } from '../../app';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './shop.html',
  styleUrls: ['./shop.scss'],
})
export class ShopComponent {

  constructor(
    public cartService: CartService,
    private http: HttpClient,
    private router: Router,
    private app: AppComponent
  ) {
    this.app.checkout = this.checkout.bind(this);
  }


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

  // ✅ This is the method you pass to the cart drawer
  async checkout() {
    const items = this.cartService.getItems();
    if (!items.length) {
      alert('Your cart is empty');
      return;
    }

    try {
      const session: any = await firstValueFrom(
        this.http.post('http://localhost:3000/create-checkout-session', { items })
      );

      const stripe = (window as any).Stripe('pk_test_51SuvEGAlfQqlrR1gGy8UM0GgroQbgKwS590ceHCLBlTIXep5VGVO4jnoCb2hUScOQwBSUibSMRU3WWbIjGZhBjYO00PlDxktbv');

      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });

      if (error) {
        console.error('Stripe redirect error:', error);
        alert('Failed to redirect to checkout. Please try again.');
      }

    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Failed to start checkout. Please try again.');
    }
  }
}
