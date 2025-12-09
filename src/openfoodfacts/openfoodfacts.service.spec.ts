import { Test, TestingModule } from '@nestjs/testing';
import { OpenfoodfactsService } from './openfoodfacts.service';

describe('OpenfoodfactsService', () => {
  let service: OpenfoodfactsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenfoodfactsService],
    }).compile();

    service = module.get<OpenfoodfactsService>(OpenfoodfactsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
