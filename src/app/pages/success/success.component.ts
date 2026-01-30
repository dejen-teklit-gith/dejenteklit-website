import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success',
  standalone: true,
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
})
export class SuccessComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Show popup for 2.5 seconds, then go to shop
    setTimeout(() => {
      this.router.navigate(['/shop']);
    }, 1000);
  }
}
