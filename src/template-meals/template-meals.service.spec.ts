import { Test, TestingModule } from '@nestjs/testing';
import { TemplateMealsService } from './template-meals.service';

describe('TemplateMealsService', () => {
  let service: TemplateMealsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateMealsService],
    }).compile();

    service = module.get<TemplateMealsService>(TemplateMealsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
