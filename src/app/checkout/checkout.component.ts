import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var Stripe: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {

  cartItems: any[] = JSON.parse(localStorage.getItem('cart') || '[]');
  customerEmail: string = '';

  constructor(private http: HttpClient) {}

  checkout() {
    if (!this.customerEmail) {
      alert('Please enter your email');
      return;
    }

    this.http.post<any>('http://localhost:3000/create-checkout-session', {
      items: this.cartItems,
      email: this.customerEmail
    }).subscribe(res => {

      const stripe = Stripe('YOUR_STRIPE_PUBLIC_KEY');

      stripe.redirectToCheckout({
        sessionId: res.id
      });
    });
  }
}
