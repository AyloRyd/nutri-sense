import { Test, TestingModule } from '@nestjs/testing';
import { OpenfoodfactsController } from './openfoodfacts.controller';
import { OpenfoodfactsService } from './openfoodfacts.service';
import { ProductResponseDto } from './dto/product-response.dto';

describe('OpenfoodfactsController', () => {
  let controller: OpenfoodfactsController;
  let service: OpenfoodfactsService;

  const mockProductResponse: ProductResponseDto = {
    name: 'Nutella',
    calories: 539,
    protein: 6.3,
    fats: 30.9,
    carbs: 57.5,
  };

  const mockOpenfoodfactsService = {
    getProduct: jest.fn().mockResolvedValue(mockProductResponse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenfoodfactsController],
      providers: [
        {
          provide: OpenfoodfactsService,
          useValue: mockOpenfoodfactsService,
        },
      ],
    }).compile();

    controller = module.get<OpenfoodfactsController>(OpenfoodfactsController);
    service = module.get<OpenfoodfactsService>(OpenfoodfactsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProduct', () => {
    it('should return product data for a barcode', async () => {
      const barcode = '3017620422003';
      const result = await controller.getProduct(barcode);
      expect(result).toEqual(mockProductResponse);
      expect(service.getProduct).toHaveBeenCalledWith(barcode);
    });
  });
});
