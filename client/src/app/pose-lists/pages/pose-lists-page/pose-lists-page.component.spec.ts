import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoseListsPageComponent } from './pose-lists.component';

describe('PoseListsComponent', () => {
  let component: PoseListsPageComponent;
  let fixture: ComponentFixture<PoseListsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PoseListsPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PoseListsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
