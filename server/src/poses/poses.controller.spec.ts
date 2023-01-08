import { Test, TestingModule } from '@nestjs/testing';
import { PosesController } from './poses.controller';

describe('PosesController', () => {
  let controller: PosesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PosesController],
    }).compile();

    controller = module.get<PosesController>(PosesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
