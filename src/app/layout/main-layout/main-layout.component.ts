import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CartDrawerComponent } from '../cart-drawer/cart-drawer.component';
import { SubscribePopupComponent } from '../../components/subscribe-popup/subscribe-popup.component';

import { CartService } from '../../service/cart.service';
import { SubscribeService } from '../../service/subscribe.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    CartDrawerComponent,
    SubscribePopupComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements AfterViewInit {
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
