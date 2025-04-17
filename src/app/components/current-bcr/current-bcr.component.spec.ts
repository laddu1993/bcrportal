import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentBcrComponent } from './current-bcr.component';

describe('CurrentBcrComponent', () => {
  let component: CurrentBcrComponent;
  let fixture: ComponentFixture<CurrentBcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrentBcrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentBcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
