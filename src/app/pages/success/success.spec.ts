import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuccessComponent } from './success.component'; // ✅ Correct name

describe('SuccessComponent', () => {
  let component: SuccessComponent;
  let fixture: ComponentFixture<SuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessComponent] // ✅ match the class name
    })
      .compileComponents();

    fixture = TestBed.createComponent(SuccessComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
