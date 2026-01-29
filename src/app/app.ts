import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './layout/navbar/navbar';
import { FooterComponent } from './layout/footer/footer';
import { CartDrawerComponent } from './layout/cart-drawer/cart-drawer';
import { CartService } from './services/cart';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    CartDrawerComponent, // ✅ add cart drawer component here
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  constructor(public cartService: CartService) {} // ✅ inject CartService
  checkout!: () => void;  // will be set by Shop
}

