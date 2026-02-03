// src/app/pages/account/account-profile.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-profile.component.html',
  styleUrl: './account-profile.component.scss',
})
export class AccountProfileComponent implements OnInit {
  userData: any = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // 1. Get the current user from the service
    this.userData = this.auth.getUser();

    // 2. Optional: Subscribe to changes so the UI stays in sync
    this.auth.user$.subscribe(user => {
      this.userData = user;
    });
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
