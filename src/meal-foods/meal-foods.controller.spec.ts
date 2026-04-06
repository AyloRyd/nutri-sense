jest.mock('./meal-foods.service');

import { Test, TestingModule } from '@nestjs/testing';
import { MealFoodsController } from './meal-foods.controller';
import { MealFoodsService } from './meal-foods.service';
import { CreateMealFoodDto } from './dto/create-meal-food.dto';
import { UpdateMealFoodDto } from './dto/update-meal-food.dto';

import { JwtRequest } from 'src/auth/types/jwt-request.interface';

describe('MealFoodsController', () => {
  let controller: MealFoodsController;
  let service: MealFoodsService;

  const mockUser = { id: 1, email: 'test@example.com' };
  const mockRequest = { user: mockUser } as unknown as JwtRequest;
  const mockMealId = 1;
  const mockMealFoodId = 1;

  const mockMealFood = {
    id: mockMealFoodId,
    meal_id: mockMealId,
    name: 'Chicken Breast',
    weight: 150,
    calories: 247.5,
    protein: 46.5,
    fats: 5.4,
    carbs: 0,
  };

  const mockMealFoodsService = {
    findAll: jest.fn().mockResolvedValue([mockMealFood]),
    findOne: jest.fn().mockResolvedValue(mockMealFood),
    create: jest.fn().mockResolvedValue(mockMealFood),
    update: jest.fn().mockResolvedValue(mockMealFood),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealFoodsController],
      providers: [
        {
          provide: MealFoodsService,
          useValue: mockMealFoodsService,
        },
      ],
    }).compile();

    controller = module.get<MealFoodsController>(MealFoodsController);
    service = module.get<MealFoodsService>(MealFoodsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of meal foods', async () => {
      const result = await controller.findAll(mockRequest, mockMealId);
      expect(result).toEqual([mockMealFood]);
      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, mockMealId);
    });
  });

  describe('findOne', () => {
    it('should return a single meal food', async () => {
      const result = await controller.findOne(
        mockRequest,
        mockMealId,
        mockMealFoodId,
      );
      expect(result).toEqual(mockMealFood);
      expect(service.findOne).toHaveBeenCalledWith(
        mockUser.id,
        mockMealId,
        mockMealFoodId,
      );
    });
  });

  describe('create', () => {
    it('should create a new meal food', async () => {
      const dto: CreateMealFoodDto = {
        name: 'Chicken Breast',
        weight: 150,
        calories: 165,
        protein: 31,
        fats: 3.6,
        carbs: 0,
      };
      const result = await controller.create(mockRequest, mockMealId, dto);
      expect(result).toEqual(mockMealFood);
      expect(service.create).toHaveBeenCalledWith(mockUser.id, mockMealId, dto);
    });
  });

  describe('update', () => {
    it('should update an existing meal food', async () => {
      const dto: UpdateMealFoodDto = { weight: 200 };
      const result = await controller.update(
        mockRequest,
        mockMealId,
        mockMealFoodId,
        dto,
      );
      expect(result).toEqual(mockMealFood);
      expect(service.update).toHaveBeenCalledWith(
        mockUser.id,
        mockMealId,
        mockMealFoodId,
        dto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a meal food', async () => {
      await controller.remove(mockRequest, mockMealId, mockMealFoodId);
      expect(service.remove).toHaveBeenCalledWith(
        mockUser.id,
        mockMealId,
        mockMealFoodId,
      );
    });
  });
});
