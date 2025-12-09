import { Test, TestingModule } from '@nestjs/testing';
import { OpenfoodfactsController } from './openfoodfacts.controller';
import { OpenfoodfactsService } from './openfoodfacts.service';

describe('OpenfoodfactsController', () => {
  let controller: OpenfoodfactsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenfoodfactsController],
      providers: [OpenfoodfactsService],
    }).compile();

    controller = module.get<OpenfoodfactsController>(OpenfoodfactsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
