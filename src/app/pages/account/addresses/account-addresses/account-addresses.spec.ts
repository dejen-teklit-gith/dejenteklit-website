import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountAddresses } from './account-addresses.component';

describe('AccountAddresses', () => {
  let component: AccountAddresses;
  let fixture: ComponentFixture<AccountAddresses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountAddresses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountAddresses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
