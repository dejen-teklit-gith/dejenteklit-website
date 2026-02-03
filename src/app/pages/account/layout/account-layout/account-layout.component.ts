import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@service/auth.service';

@Component({
  selector: 'app-account-layout',
  standalone: true,
  imports: [
    CommonModule,   // ✅ REQUIRED for *ngIf
    RouterModule    // ✅ REQUIRED for routerLink / router-outlet
  ],
  templateUrl: './account-layout.component.html',
  styleUrls: ['./account-layout.component.scss'],
})
export class AccountLayoutComponent {

  // ✅ MUST be public for template access
  public user: any | null = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.user = this.auth.getUser();
  }

  // ✅ MUST be public for template access
  public logout(): void {
    this.auth.logout();
    this.user = null;
    this.router.navigate(['/login']);
  }
}
