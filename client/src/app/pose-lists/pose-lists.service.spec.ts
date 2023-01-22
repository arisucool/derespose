import { TestBed } from '@angular/core/testing';

import { PoseListsService } from './pose-lists.service';

describe('PoseListsService', () => {
  let service: PoseListsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PoseListsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
