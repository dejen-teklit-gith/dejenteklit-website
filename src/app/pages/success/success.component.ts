import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart'; // ✅ correct import

@Component({
  selector: 'app-success',
  standalone: true,
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
})
export class SuccessComponent implements OnInit {

  constructor(private router: Router, public cartService: CartService) {}

  ngOnInit(): void {
    // Clear the cart after successful payment
    this.cartService.clearCart();

    // Redirect to shop after 1 second
    setTimeout(() => {
      this.router.navigate(['/shop']);
    }, 1000);
  }
}
