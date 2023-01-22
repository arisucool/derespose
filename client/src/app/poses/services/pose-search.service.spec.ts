import { TestBed } from '@angular/core/testing';

import { PoseSearchService } from './pose-search.service';

describe('PoseSearchService', () => {
  let service: PoseSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PoseSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
