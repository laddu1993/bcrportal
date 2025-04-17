import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditAndBillComponent } from './credit-and-bill.component';

describe('CreditAndBillComponent', () => {
  let component: CreditAndBillComponent;
  let fixture: ComponentFixture<CreditAndBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreditAndBillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditAndBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
