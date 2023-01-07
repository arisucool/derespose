import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchedPoseComponent } from './matched-pose.component';

describe('MatchedPoseComponent', () => {
  let component: MatchedPoseComponent;
  let fixture: ComponentFixture<MatchedPoseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatchedPoseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchedPoseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
