import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountOrders } from './account-orders';

describe('AccountOrders', () => {
  let component: AccountOrders;
  let fixture: ComponentFixture<AccountOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountOrders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountOrders);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
