import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { AuthService } from '../../service/auth.service';
import { AccountDrawerService } from '../../service/account-drawer.service';

@Component({
  selector: 'app-account-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-drawer.component.html',
  styleUrls: ['./account-drawer.component.scss'],
})
export class AccountDrawerComponent {

  // ✅ USER STATE LIVES HERE
  public user = this.auth.getUser();

  constructor(
    private auth: AuthService,
    private router: Router,
    public drawer: AccountDrawerService
  ) {
    // 🔁 keep user in sync
    this.auth.user$.subscribe(user => {
      this.user = user;
    });
  }

  // ✅ LOGOUT BELONGS HERE
  logout(): void {
    this.auth.logout();
    this.drawer.close();           // close drawer
    this.router.navigate(['/account']); // back to login/register
  }
}
