import { TestBed } from '@angular/core/testing';

import { AppCacheService } from './app-cache.service';

describe('AppCacheService', () => {
  let service: AppCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
