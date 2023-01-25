import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraSearchCtrlComponent } from './camera-search-ctrl.component';

describe('CameraSearchCtrlComponent', () => {
  let component: CameraSearchCtrlComponent;
  let fixture: ComponentFixture<CameraSearchCtrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CameraSearchCtrlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraSearchCtrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
