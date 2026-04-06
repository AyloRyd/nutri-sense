import { Test, TestingModule } from '@nestjs/testing';
import { TemplateMealFoodsController } from './template-meal-foods.controller';
import { TemplateMealFoodsService } from './template-meal-foods.service';
import { CreateTemplateMealFoodDto } from './dto/create-template-meal-food.dto';
import { UpdateTemplateMealFoodDto } from './dto/update-template-meal-food.dto';

import { JwtRequest } from 'src/auth/types/jwt-request.interface';

describe('TemplateMealFoodsController', () => {
  let controller: TemplateMealFoodsController;
  let service: TemplateMealFoodsService;

  const mockUser = { id: 1, email: 'test@example.com' };
  const mockRequest = { user: mockUser } as unknown as JwtRequest;
  const mockTemplateMealId = 1;
  const mockTemplateMealFoodId = 1;

  const mockTemplateMealFood = {
    id: mockTemplateMealFoodId,
    template_meal_id: mockTemplateMealId,
    name: 'Chicken Breast',
    weight: 150,
    calories: 247.5,
    protein: 46.5,
    fats: 5.4,
    carbs: 0,
  };

  const mockTemplateMealFoodsService = {
    findAll: jest.fn().mockResolvedValue([mockTemplateMealFood]),
    findOne: jest.fn().mockResolvedValue(mockTemplateMealFood),
    create: jest.fn().mockResolvedValue(mockTemplateMealFood),
    update: jest.fn().mockResolvedValue(mockTemplateMealFood),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateMealFoodsController],
      providers: [
        {
          provide: TemplateMealFoodsService,
          useValue: mockTemplateMealFoodsService,
        },
      ],
    }).compile();

    controller = module.get<TemplateMealFoodsController>(
      TemplateMealFoodsController,
    );
    service = module.get<TemplateMealFoodsService>(TemplateMealFoodsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of template meal foods', async () => {
      const result = await controller.findAll(mockRequest, mockTemplateMealId);
      expect(result).toEqual([mockTemplateMealFood]);
      expect(service.findAll).toHaveBeenCalledWith(
        mockUser.id,
        mockTemplateMealId,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single template meal food', async () => {
      const result = await controller.findOne(
        mockRequest,
        mockTemplateMealId,
        mockTemplateMealFoodId,
      );
      expect(result).toEqual(mockTemplateMealFood);
      expect(service.findOne).toHaveBeenCalledWith(
        mockUser.id,
        mockTemplateMealId,
        mockTemplateMealFoodId,
      );
    });
  });

  describe('create', () => {
    it('should create a new template meal food', async () => {
      const dto: CreateTemplateMealFoodDto = {
        name: 'Chicken Breast',
        weight: 150,
        calories: 165,
        protein: 31,
        fats: 3.6,
        carbs: 0,
      };
      const result = await controller.create(
        mockRequest,
        mockTemplateMealId,
        dto,
      );
      expect(result).toEqual(mockTemplateMealFood);
      expect(service.create).toHaveBeenCalledWith(
        mockUser.id,
        mockTemplateMealId,
        dto,
      );
    });
  });

  describe('update', () => {
    it('should update an existing template meal food', async () => {
      const dto: UpdateTemplateMealFoodDto = { weight: 200 };
      const result = await controller.update(
        mockRequest,
        mockTemplateMealId,
        mockTemplateMealFoodId,
        dto,
      );
      expect(result).toEqual(mockTemplateMealFood);
      expect(service.update).toHaveBeenCalledWith(
        mockUser.id,
        mockTemplateMealId,
        mockTemplateMealFoodId,
        dto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a template meal food', async () => {
      await controller.remove(
        mockRequest,
        mockTemplateMealId,
        mockTemplateMealFoodId,
      );
      expect(service.remove).toHaveBeenCalledWith(
        mockUser.id,
        mockTemplateMealId,
        mockTemplateMealFoodId,
      );
    });
  });
});
