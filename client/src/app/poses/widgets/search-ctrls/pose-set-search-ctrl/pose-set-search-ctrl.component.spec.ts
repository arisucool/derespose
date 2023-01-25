import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoseSetSearchCtrlComponent } from './pose-set-search-ctrl.component';

describe('PoseSetSearchCtrlComponent', () => {
  let component: PoseSetSearchCtrlComponent;
  let fixture: ComponentFixture<PoseSetSearchCtrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoseSetSearchCtrlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoseSetSearchCtrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
