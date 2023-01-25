import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagSearchCtrlComponent } from './tag-search-ctrl.component';

describe('TagSearchCtrlComponent', () => {
  let component: TagSearchCtrlComponent;
  let fixture: ComponentFixture<TagSearchCtrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagSearchCtrlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagSearchCtrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
