import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent {
  bookingForm = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    eventType: new FormControl('', [Validators.required]),
    date: new FormControl('', [Validators.required]),
    message: new FormControl(''),
  });

  onSubmit() {
    if (this.bookingForm.valid) {
      // Form will automatically submit to Formspree via the form action
      console.log('Form is valid, submitting to Formspree...');
      this.bookingForm.reset(); // optionally reset after submission
    } else {
      alert('Please fill all required fields correctly.');
    }
  }
}
