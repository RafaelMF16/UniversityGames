import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { ApiRequestService } from './api-request.service';

describe('ApiRequestService', () => {
  let service: ApiRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(ApiRequestService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });
});
