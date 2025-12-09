import { Test, TestingModule } from '@nestjs/testing';
import { TemplateFoodsController } from './template-foods.controller';
import { TemplateFoodsService } from './template-foods.service';

describe('TemplateFoodsController', () => {
  let controller: TemplateFoodsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateFoodsController],
      providers: [TemplateFoodsService],
    }).compile();

    controller = module.get<TemplateFoodsController>(TemplateFoodsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
