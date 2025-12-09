import { Test, TestingModule } from '@nestjs/testing';
import { TemplateMealFoodsService } from './template-meal-foods.service';

describe('TemplateMealFoodsService', () => {
  let service: TemplateMealFoodsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateMealFoodsService],
    }).compile();

    service = module.get<TemplateMealFoodsService>(TemplateMealFoodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
