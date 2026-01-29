import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  name: string;
  price: number;
  image: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {

  private items: CartItem[] = [];
  isOpen = false;

  // cart icon animation flag
  animateCart = false;

  // ✅ Toast notification as reactive stream
  private toastSubject = new BehaviorSubject<boolean>(false);
  toast$ = this.toastSubject.asObservable();

  // ---------------- CART ACTIONS ----------------

  addToCart(item: CartItem) {
    this.items.push(item);

    // 💥 Cart icon bump animation
    this.animateCart = true;
    setTimeout(() => this.animateCart = false, 300);

    // 🔔 Show toast notification
    this.toastSubject.next(true);
    setTimeout(() => {
      this.toastSubject.next(false);
    }, 2000); // toast hides after 2 seconds
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  getItems(): CartItem[] {
    return this.items;
  }

  getTotal(): number {
    return this.items.reduce((total, item) => total + item.price, 0);
  }

  toggleCart() {
    this.isOpen = !this.isOpen;
  }

  getCount(): number {
    return this.items.length;
  }
  clearCart() {
    this.items = [];
  }
}

