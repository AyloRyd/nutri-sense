import { Test, TestingModule } from '@nestjs/testing';
import { TemplateFoodsService } from './template-foods.service';

describe('TemplateFoodsService', () => {
  let service: TemplateFoodsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateFoodsService],
    }).compile();

    service = module.get<TemplateFoodsService>(TemplateFoodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
