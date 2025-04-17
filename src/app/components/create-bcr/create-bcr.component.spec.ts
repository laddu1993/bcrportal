import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBcrComponent } from './create-bcr.component';

describe('CreateBcrComponent', () => {
  let component: CreateBcrComponent;
  let fixture: ComponentFixture<CreateBcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateBcrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
