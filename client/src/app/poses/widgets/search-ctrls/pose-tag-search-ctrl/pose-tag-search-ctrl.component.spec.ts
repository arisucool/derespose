import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoseTagSearchCtrlComponent } from './pose-tag-search-ctrl.component';

describe('TagSearchCtrlComponent', () => {
  let component: PoseTagSearchCtrlComponent;
  let fixture: ComponentFixture<PoseTagSearchCtrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PoseTagSearchCtrlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PoseTagSearchCtrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
