import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTransfersComponent } from './list-transfers.component';

describe('ListTransfersComponent', () => {
  let component: ListTransfersComponent;
  let fixture: ComponentFixture<ListTransfersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListTransfersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
