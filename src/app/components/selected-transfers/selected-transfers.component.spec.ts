import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedTransfersComponent } from './selected-transfers.component';

describe('SelectedTransfersComponent', () => {
  let component: SelectedTransfersComponent;
  let fixture: ComponentFixture<SelectedTransfersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectedTransfersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedTransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
