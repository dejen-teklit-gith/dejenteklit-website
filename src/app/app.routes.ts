import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home';
import { AboutComponent } from './pages/about/about';
import { GalleryComponent } from './pages/gallery/gallery';
import { ShopComponent } from './pages/shop/shop';
import { BookingComponent } from './pages/booking/booking';
import { ContactComponent } from './pages/contact/contact';
import { SuccessComponent } from './pages/success/success.component';
import { CancelComponent } from './pages/cancel/cancel.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';

import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { AccountComponent } from './pages/account/account';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'success', component: SuccessComponent },
  { path: 'cancel', component: CancelComponent },
  { path: 'checkout', component: CheckoutComponent },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'account', component: AccountComponent },
];
