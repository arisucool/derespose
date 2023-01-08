import { Test, TestingModule } from '@nestjs/testing';
import { PoseTagsService } from './pose-tags.service';

describe('PoseTagsService', () => {
  let service: PoseTagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoseTagsService],
    }).compile();

    service = module.get<PoseTagsService>(PoseTagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
