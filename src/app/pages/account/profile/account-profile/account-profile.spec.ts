import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountProfileComponent  } from './account-profile';

describe('AccountProfileComponent ', () => {
  let component: AccountProfileComponent ;
  let fixture: ComponentFixture<AccountProfileComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountProfileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountProfileComponent );
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
