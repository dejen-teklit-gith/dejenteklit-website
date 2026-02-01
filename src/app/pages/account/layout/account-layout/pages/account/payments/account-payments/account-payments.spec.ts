import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPayments } from './account-payments';

describe('AccountPayments', () => {
  let component: AccountPayments;
  let fixture: ComponentFixture<AccountPayments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountPayments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountPayments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
