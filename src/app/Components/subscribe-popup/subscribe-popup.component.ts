import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subscribe-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscribe-popup.component.html',
  styleUrls: ['./subscribe-popup.component.scss'],
})

export class SubscribePopupComponent {
  email = '';
  visible = false;
  message = '';

  constructor(private http: HttpClient) {}

  open() {
    this.visible = true;
  }

  close() {
    this.visible = false;
    this.message = '';
    this.email = '';
  }

  subscribe() {
    this.http
      .post('http://localhost:3000/subscribe', { email: this.email })
      .subscribe(() => {
        this.message = 'Thank you for subscribing!';
        setTimeout(() => this.close(), 2000);
      });
  }
}
