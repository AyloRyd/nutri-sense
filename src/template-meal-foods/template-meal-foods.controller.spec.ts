import { Test, TestingModule } from '@nestjs/testing';
import { TemplateMealFoodsController } from './template-meal-foods.controller';
import { TemplateMealFoodsService } from './template-meal-foods.service';

describe('TemplateMealFoodsController', () => {
  let controller: TemplateMealFoodsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateMealFoodsController],
      providers: [TemplateMealFoodsService],
    }).compile();

    controller = module.get<TemplateMealFoodsController>(TemplateMealFoodsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
