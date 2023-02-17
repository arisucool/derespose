import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoseTagsPageComponent } from './pose-tags-page.component';

describe('PoseTagsPageComponent', () => {
  let component: PoseTagsPageComponent;
  let fixture: ComponentFixture<PoseTagsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoseTagsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoseTagsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
