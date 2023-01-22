import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportedPosesPageComponent } from './supported-poses-page.component';

describe('SupportedPosesComponent', () => {
  let component: SupportedPosesPageComponent;
  let fixture: ComponentFixture<SupportedPosesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupportedPosesPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SupportedPosesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
