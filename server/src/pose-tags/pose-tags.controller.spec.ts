import { Test, TestingModule } from '@nestjs/testing';
import { PoseTagsController } from './pose-tags.controller';

describe('PoseTagsController', () => {
  let controller: PoseTagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoseTagsController],
    }).compile();

    controller = module.get<PoseTagsController>(PoseTagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
