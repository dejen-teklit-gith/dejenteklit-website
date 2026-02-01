import { Routes } from '@angular/router';

// public pages
import { HomeComponent } from './pages/home/home';
import { AboutComponent } from './pages/about/about';
import { GalleryComponent } from './pages/gallery/gallery';
import { ShopComponent } from './pages/shop/shop';
import { BookingComponent } from './pages/booking/booking';
import { ContactComponent } from './pages/contact/contact';
import { SuccessComponent } from './pages/success/success.component';
import { CancelComponent } from './pages/cancel/cancel.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';

// auth
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password';

// ✅ ACCOUNT (CORRECT, VERIFIED PATHS)
import { AccountLayoutComponent } from './pages/account/layout/account-layout/account-layout.component';
import { AccountOrdersComponent } from './pages/account/orders/account-orders/account-orders';
import { AccountProfileComponent } from './pages/account/profile/account-profile/account-profile';
import { AccountAddressesComponent } from './pages/account/addresses/account-addresses/account-addresses.component';
import { AccountPaymentsComponent } from './pages/account/payments/account-payments/account-payments';
import { AccountSecurityComponent } from './pages/account/security/account-security/account-security';

// order details
import { OrderDetailsComponent } from './pages/order-details/order-details';
import {AccountComponent} from './pages/account/account';
export const routes: Routes = [
  // 🌍 public
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'success', component: SuccessComponent },
  { path: 'cancel', component: CancelComponent },
  { path: 'checkout', component: CheckoutComponent },

  // 🔐 auth
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // 👤 ACCOUNT ENTRY (login / register gate)
  {
    path: 'account',
    component: AccountComponent,
  },

  // 🧭 REAL ACCOUNT APP (only after login)
  {
    path: 'account/app',
    component: AccountLayoutComponent,
    children: [
      { path: '', component: AccountOrdersComponent },           // /account/app
      { path: 'profile', component: AccountProfileComponent },  // /account/app/profile
      { path: 'addresses', component: AccountAddressesComponent },
      { path: 'payments', component: AccountPaymentsComponent },
      { path: 'security', component: AccountSecurityComponent },
    ],
  },

  // 📦 order details
  { path: 'order/:id', component: OrderDetailsComponent },
];
