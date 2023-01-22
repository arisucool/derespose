import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPoseListSelectorDialogComponent } from './my-pose-list-selector-dialog.component';

describe('MyPoseListSelectorDialogComponent', () => {
  let component: MyPoseListSelectorDialogComponent;
  let fixture: ComponentFixture<MyPoseListSelectorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyPoseListSelectorDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPoseListSelectorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
