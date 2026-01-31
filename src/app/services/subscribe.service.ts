import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubscribeService {
  private openSource = new Subject<void>();
  open$ = this.openSource.asObservable();

  open() {
    this.openSource.next();
  }
}
