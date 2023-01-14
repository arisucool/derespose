import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportedPosesComponent } from './supported-poses.component';

describe('SupportedPosesComponent', () => {
  let component: SupportedPosesComponent;
  let fixture: ComponentFixture<SupportedPosesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupportedPosesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportedPosesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
