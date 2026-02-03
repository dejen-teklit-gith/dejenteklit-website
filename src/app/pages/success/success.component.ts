import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../service/cart.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
})
export class SuccessComponent implements OnInit {
  loggedIn = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loggedIn = this.auth.isLoggedIn();

    // ✅ Clear cart immediately
    this.cartService.clearCart();

    // ✅ Redirect after toast
    setTimeout(() => {
      this.router.navigate([this.loggedIn ? '/account' : '/shop']);
    }, 2000); // 2s feels instant & polished
  }
}
