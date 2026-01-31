import {AfterViewInit, Component, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './layout/navbar/navbar';
import { FooterComponent } from './layout/footer/footer';
import { CartDrawerComponent } from './layout/cart-drawer/cart-drawer';
import { CartService } from './services/cart';
import { SubscribePopupComponent } from './Components/subscribe-popup/subscribe-popup.component';
import { SubscribeService } from './services/subscribe.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    CartDrawerComponent,
    SubscribePopupComponent,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('subscribePopup') popup!: SubscribePopupComponent;

  constructor(
    public cartService: CartService,
    private subscribeService: SubscribeService
  ) {}

  ngAfterViewInit() {
    this.subscribeService.open$.subscribe(() => {
      this.popup.open();
    });
  }
}
