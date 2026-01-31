import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscribePopupComponent } from './subscribe-popup.component';

describe('SubscribePopup', () => {
  let component: SubscribePopupComponent;
  let fixture: ComponentFixture<SubscribePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscribePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscribePopupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
