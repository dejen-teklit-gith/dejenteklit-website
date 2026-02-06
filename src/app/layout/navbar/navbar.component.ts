import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {
  LucideAngularModule,
  Mail,
  Search,
  User,
  ShoppingCart,
  Menu,
  X,
} from 'lucide-angular';

import { CartService } from '../../service/cart.service';
import { SubscribeService } from '../../service/subscribe.service';
import { AuthService } from '../../service/auth.service';
import { AccountDrawerService } from '../../service/account-drawer.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  menuOpen = false;

  // Icons
  readonly Mail = Mail;
  readonly Search = Search;
  readonly User = User;
  readonly ShoppingCart = ShoppingCart;
  readonly Menu = Menu;
  readonly X = X;

  constructor(
    public cartService: CartService,
    private router: Router, // ✅ REQUIRED
    private subscribeService: SubscribeService,
    public auth: AuthService,
    private accountDrawer: AccountDrawerService
  ) {}
  // 📧 Subscribe popup
  openSubscribe(): void {
    this.subscribeService.open();
  }

  // 🍔 Mobile menu
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  // 🛒 Cart drawer
  toggleCart(): void {
    this.cartService.toggleCart();
  }

  // 👤 Account drawer (CORRECT UX)
  toggleAccount(): void {
    if (this.auth.isLoggedIn()) {
      this.accountDrawer.toggle();
    } else {
      // Not logged in → go to account entry page
      this.accountDrawer.close();
      window.location.href = '/account';
    }
  }
  goToAccount(): void {
    if (this.auth.isLoggedIn()) {
      this.accountDrawer.open();   // ✅ open drawer
    } else {
      this.router.navigate(['/account']); // ✅ go to login/register
    }
  }

}
