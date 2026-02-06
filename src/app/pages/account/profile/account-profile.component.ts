import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '@service/auth.service';

@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.scss'],
})
export class AccountProfileComponent implements OnDestroy {

  user: any = null;

  firstName = '';
  lastName = '';
  email = '';

  avatarPreview: string | null = null;
  allowEmailEdit = false;

  saving = false;
  message = '';

  private sub!: Subscription;

  constructor(private auth: AuthService) {
    this.sub = this.auth.user$.subscribe(user => {
      this.user = user;

      if (user) {
        this.firstName = user.first_name || '';
        this.lastName = user.last_name || '';
        this.email = user.email || '';
        this.avatarPreview = user.avatar || null;
      }
    });
  }

  /** 🔥 Detect changes */
  get hasChanges(): boolean {
    return (
      this.firstName !== this.user?.first_name ||
      this.lastName !== this.user?.last_name ||
      this.email !== this.user?.email ||
      !!this.avatarPreview
    );
  }

  /** 🖼 Avatar upload */
  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  /** 💾 Save profile */
  async save(): Promise<void> {
    if (this.saving || !this.hasChanges) return;

    this.saving = true;
    this.message = '';

    try {
      // 🔥 UPDATE GLOBAL AUTH STATE
      this.auth.updateLocalUser({
        first_name: this.firstName,
        last_name: this.lastName,
        avatar: this.avatarPreview,
        email: this.email,
      });

      this.message = 'Profile updated successfully';

      setTimeout(() => {
        this.message = '';
      }, 3000);

    } catch {
      this.message = 'Failed to update profile';
    } finally {
      this.saving = false;
      this.allowEmailEdit = false;
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
