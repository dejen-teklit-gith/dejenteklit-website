import { Routes } from '@angular/router';

// 🔹 LAYOUTS
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AccountLayoutComponent } from './pages/account/layout/account-layout/account-layout.component';

// 🔹 PUBLIC PAGES
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { ShopComponent } from './pages/shop/shop.component';
import { MusicComponent } from './pages/music/music.component';
import { BookingComponent } from './pages/booking/booking.component';
import { ContactComponent } from './pages/contact/contact.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { SuccessComponent } from './pages/success/success.component';
import { CancelComponent } from './pages/cancel/cancel.component';
import { OrderDetailsComponent } from './pages/order-details/order-details.component';

// 🔹 AUTH
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';

// 🔹 ACCOUNT
import { AccountComponent } from './pages/account/account.component';
import { AccountOrdersComponent } from './pages/account/orders/account-orders.component';
import { AccountProfileComponent } from './pages/account/profile/account-profile.component';
import { AccountAddressesComponent } from './pages/account/addresses/account-addresses.component';
import { AccountPaymentsComponent } from './pages/account/payments/account-payments.component';
import { AccountSecurityComponent } from './pages/account/security/account-security.component';

export const routes: Routes = [
  // 🌍 EVERYTHING WITH NAVBAR / FOOTER
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // Public
      { path: '', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'gallery', component: GalleryComponent },
      { path: 'shop', component: ShopComponent },
      { path: 'music', component: MusicComponent },
      { path: 'booking', component: BookingComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'success', component: SuccessComponent },
      { path: 'cancel', component: CancelComponent },
      { path: 'order/:id', component: OrderDetailsComponent },

      // Auth
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },

      // 👤 ACCOUNT ENTRY
      { path: 'account', component: AccountComponent },

      // 🧭 ACCOUNT DASHBOARD
      {
        path: 'account/app',
        component: AccountLayoutComponent,
        children: [
          { path: '', component: AccountOrdersComponent },
          { path: 'profile', component: AccountProfileComponent },
          { path: 'addresses', component: AccountAddressesComponent },
          { path: 'payments', component: AccountPaymentsComponent },
          { path: 'security', component: AccountSecurityComponent },
        ],
      },
    ],
  },

  // ❌ FALLBACK
  { path: '**', redirectTo: '' },
];
