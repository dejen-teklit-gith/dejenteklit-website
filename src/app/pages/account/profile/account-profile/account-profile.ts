import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RegisterComponent} from '../../../auth/register/register';
import {AuthService} from '../../../../services/auth';
@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-profile.html',
  styleUrls: ['./account-profile.scss'],
})
export class AccountProfileComponent implements OnInit {

  user: any = null;
  loading = true;

  constructor(private auth: AuthService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.user = await this.auth.getMe();
    } catch {
      this.user = null;
    } finally {
      this.loading = false;
    }
  }
}
