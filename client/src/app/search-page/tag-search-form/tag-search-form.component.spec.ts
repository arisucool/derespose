import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagSearchFormComponent } from './tag-search-form.component';

describe('TagSearchFormComponent', () => {
  let component: TagSearchFormComponent;
  let fixture: ComponentFixture<TagSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagSearchFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
