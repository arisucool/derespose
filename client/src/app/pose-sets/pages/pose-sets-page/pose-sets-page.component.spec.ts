import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoseSetsPageComponent } from './pose-sets-page.component';

describe('PoseSetsPageComponent', () => {
  let component: PoseSetsPageComponent;
  let fixture: ComponentFixture<PoseSetsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoseSetsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoseSetsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
