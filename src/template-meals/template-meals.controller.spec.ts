import { Test, TestingModule } from '@nestjs/testing';
import { TemplateMealsController } from './template-meals.controller';
import { TemplateMealsService } from './template-meals.service';

describe('TemplateMealsController', () => {
  let controller: TemplateMealsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateMealsController],
      providers: [TemplateMealsService],
    }).compile();

    controller = module.get<TemplateMealsController>(TemplateMealsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
