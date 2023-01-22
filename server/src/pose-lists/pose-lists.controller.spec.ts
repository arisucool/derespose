import { Test, TestingModule } from '@nestjs/testing';
import { PoseListsController } from './pose-lists.controller';

describe('PoseListsController', () => {
  let controller: PoseListsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoseListsController],
    }).compile();

    controller = module.get<PoseListsController>(PoseListsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
