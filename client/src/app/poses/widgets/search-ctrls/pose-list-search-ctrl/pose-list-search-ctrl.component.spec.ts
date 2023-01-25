import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoseListSearchCtrlComponent } from './pose-list-search-ctrl.component';

describe('PoseListSearchCtrlComponent', () => {
  let component: PoseListSearchCtrlComponent;
  let fixture: ComponentFixture<PoseListSearchCtrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoseListSearchCtrlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoseListSearchCtrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
