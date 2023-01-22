import { Test, TestingModule } from '@nestjs/testing';
import { PoseListsService } from './pose-lists.service';

describe('PoseListsService', () => {
  let service: PoseListsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoseListsService],
    }).compile();

    service = module.get<PoseListsService>(PoseListsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
