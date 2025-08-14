import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealerModalComponent } from './dealer-modal.component';

describe('DealerModalComponent', () => {
  let component: DealerModalComponent;
  let fixture: ComponentFixture<DealerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DealerModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DealerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
