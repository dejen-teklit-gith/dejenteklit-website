import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CancelComponent } from './cancel.component'; // ✅ Correct import

describe('CancelComponent', () => {
  let component: CancelComponent; // ✅ Correct type
  let fixture: ComponentFixture<CancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelComponent] // ✅ Use the class name
    })
      .compileComponents();

    fixture = TestBed.createComponent(CancelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
