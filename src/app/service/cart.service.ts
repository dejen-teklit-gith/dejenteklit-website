import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export interface CartItem {
  name: string;
  price: number;
  image: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(private http: HttpClient) {
    // ✅ Load cart when app starts
    const saved = localStorage.getItem('cart');
    if (saved) {
      this.items = JSON.parse(saved);
    }
  }

  // ---------------- STATE ----------------

  private items: CartItem[] = [];
  isOpen = false;

  animateCart = false;

  private toastSubject = new BehaviorSubject<boolean>(false);
  toast$ = this.toastSubject.asObservable();

  // ---------------- INTERNAL SAVE ----------------

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  // ---------------- CART ACTIONS ----------------

  addToCart(item: CartItem) {
    this.items.push(item);
    this.saveCart();

    // 💥 Cart bump animation
    this.animateCart = true;
    setTimeout(() => (this.animateCart = false), 300);

    // 🔔 Toast
    this.toastSubject.next(true);
    setTimeout(() => this.toastSubject.next(false), 2000);
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.saveCart();
  }

  clearCart() {
    this.items = [];
    this.saveCart();
  }

  getItems(): CartItem[] {
    return this.items;
  }

  getTotal(): number {
    return this.items.reduce((total, item) => total + item.price, 0);
  }

  getCount(): number {
    return this.items.length;
  }

  toggleCart() {
    this.isOpen = !this.isOpen;
  }

  // ---------------- CHECKOUT ----------------

  async checkout() {
    const items = this.getItems();

    if (!items.length) {
      alert('Cart is empty');
      return;
    }

    try {
      const session: any = await firstValueFrom(
        this.http.post('http://localhost:3000/create-checkout-session', { items })
      );

      const stripe = (window as any).Stripe('pk_test_51SuvEGAlfQqlrR1gGy8UM0GgroQbgKwS590ceHCLBlTIXep5VGVO4jnoCb2hUScOQwBSUibSMRU3WWbIjGZhBjYO00PlDxktbv'); // YOUR REAL KEY

      await stripe.redirectToCheckout({
        sessionId: session.id,
      });

    } catch (err) {
      console.error('Checkout error', err);
      alert('Checkout failed');
    }
  }

}
