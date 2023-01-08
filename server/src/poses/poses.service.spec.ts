import { Test, TestingModule } from '@nestjs/testing';
import { PosesService } from './poses.service';

describe('PosesService', () => {
  let service: PosesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PosesService],
    }).compile();

    service = module.get<PosesService>(PosesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
