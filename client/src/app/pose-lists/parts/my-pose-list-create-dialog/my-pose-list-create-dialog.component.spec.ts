import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPoseListCreateDialogComponent } from './my-pose-list-create-dialog.component';

describe('MyPoseListCreateDialogComponent', () => {
  let component: MyPoseListCreateDialogComponent;
  let fixture: ComponentFixture<MyPoseListCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyPoseListCreateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPoseListCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
