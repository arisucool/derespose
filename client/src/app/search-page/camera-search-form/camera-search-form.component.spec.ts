import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraSearchFormComponent } from './camera-search-form.component';

describe('CameraSearchFormComponent', () => {
  let component: CameraSearchFormComponent;
  let fixture: ComponentFixture<CameraSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CameraSearchFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
