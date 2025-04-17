import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCurrentBcrComponent } from './view-current-bcr.component';

describe('ViewCurrentBcrComponent', () => {
  let component: ViewCurrentBcrComponent;
  let fixture: ComponentFixture<ViewCurrentBcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewCurrentBcrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCurrentBcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
