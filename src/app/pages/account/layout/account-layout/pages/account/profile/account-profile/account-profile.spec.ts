import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountProfile } from './account-profile';

describe('AccountProfile', () => {
  let component: AccountProfile;
  let fixture: ComponentFixture<AccountProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
