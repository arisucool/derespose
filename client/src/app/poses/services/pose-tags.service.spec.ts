import { TestBed } from '@angular/core/testing';

import { PoseTagsService } from './pose-tags.service';

describe('PoseTagsService', () => {
  let service: PoseTagsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PoseTagsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
