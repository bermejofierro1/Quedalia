import { TestBed } from '@angular/core/testing';

import { TricoinsService } from './tricoins.service';

describe('TricoinsService', () => {
  let service: TricoinsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TricoinsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
