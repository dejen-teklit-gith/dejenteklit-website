import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-account-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl:'./account-addresses.component.html',
  styleUrls: ['./account-addresses.scss'],
})
export class AccountAddressesComponent {
}
