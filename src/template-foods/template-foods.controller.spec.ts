import { Test, TestingModule } from '@nestjs/testing';
import { TemplateFoodsController } from './template-foods.controller';
import { TemplateFoodsService } from './template-foods.service';
import { CreateTemplateFoodDto } from './dto/create-template-food.dto';
import { UpdateTemplateFoodDto } from './dto/update-template-food.dto';

import { JwtRequest } from 'src/auth/types/jwt-request.interface';

describe('TemplateFoodsController', () => {
  let controller: TemplateFoodsController;
  let service: TemplateFoodsService;

  const mockUser = { id: 1, email: 'test@example.com' };
  const mockRequest = { user: mockUser } as unknown as JwtRequest;
  const mockTemplateFoodId = 1;

  const mockTemplateFood = {
    id: mockTemplateFoodId,
    user_id: mockUser.id,
    name: 'Chicken Breast',
    calories: 165,
    protein: 31,
    fats: 3.6,
    carbs: 0,
  };

  const mockTemplateFoodsService = {
    findAll: jest.fn().mockResolvedValue([mockTemplateFood]),
    findOne: jest.fn().mockResolvedValue(mockTemplateFood),
    create: jest.fn().mockResolvedValue(mockTemplateFood),
    update: jest.fn().mockResolvedValue(mockTemplateFood),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateFoodsController],
      providers: [
        {
          provide: TemplateFoodsService,
          useValue: mockTemplateFoodsService,
        },
      ],
    }).compile();

    controller = module.get<TemplateFoodsController>(TemplateFoodsController);
    service = module.get<TemplateFoodsService>(TemplateFoodsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of template foods', async () => {
      const result = await controller.findAll(mockRequest);
      expect(result).toEqual([mockTemplateFood]);
      expect(service.findAll).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should return a single template food', async () => {
      const result = await controller.findOne(mockRequest, mockTemplateFoodId);
      expect(result).toEqual(mockTemplateFood);
      expect(service.findOne).toHaveBeenCalledWith(
        mockUser.id,
        mockTemplateFoodId,
      );
    });
  });

  describe('create', () => {
    it('should create a new template food', async () => {
      const dto: CreateTemplateFoodDto = {
        name: 'Chicken Breast',
        calories: 165,
        protein: 31,
        fats: 3.6,
        carbs: 0,
      };
      const result = await controller.create(mockRequest, dto);
      expect(result).toEqual(mockTemplateFood);
      expect(service.create).toHaveBeenCalledWith(mockUser.id, dto);
    });
  });

  describe('update', () => {
    it('should update an existing template food', async () => {
      const dto: UpdateTemplateFoodDto = { name: 'Cooked Chicken' };
      const result = await controller.update(
        mockRequest,
        mockTemplateFoodId,
        dto,
      );
      expect(result).toEqual(mockTemplateFood);
      expect(service.update).toHaveBeenCalledWith(
        mockUser.id,
        mockTemplateFoodId,
        dto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a template food', async () => {
      await controller.remove(mockRequest, mockTemplateFoodId);
      expect(service.remove).toHaveBeenCalledWith(
        mockUser.id,
        mockTemplateFoodId,
      );
    });
  });
});
