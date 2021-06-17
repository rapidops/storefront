import { TestBed } from '@angular/core/testing';

import { CampaignNameService } from './campaign-name.service';

describe('CampaignNameService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CampaignNameService = TestBed.get(CampaignNameService);
    expect(service).toBeTruthy();
  });
});
