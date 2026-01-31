import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Mail, Search, User,
  ShoppingCart,
  Menu,
  X } from 'lucide-angular';
import { CartService } from '../../services/cart';
import { SubscribeService } from '../../services/subscribe.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class NavbarComponent {
  menuOpen = false;

  readonly Mail = Mail;
  readonly Search = Search;
  readonly User = User;
  readonly ShoppingCart = ShoppingCart;
  readonly Menu = Menu;
  readonly X = X;

  constructor(
    public cartService: CartService,
    private subscribeService: SubscribeService // Inject the service
  ) {}
  openSubscribe() {
    this.subscribeService.open();
  }
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleCart() {
    this.cartService.toggleCart();
  }

}
