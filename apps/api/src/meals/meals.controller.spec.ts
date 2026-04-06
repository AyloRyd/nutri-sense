import { Test, TestingModule } from '@nestjs/testing';
import { MealsController } from './meals.controller';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { GetMealsFilterDto } from './dto/get-meals-filter.dto';

import { JwtRequest } from 'src/auth/types/jwt-request.interface';

describe('MealsController', () => {
  let controller: MealsController;
  let service: MealsService;

  const mockUser = { id: 1, email: 'test@example.com' };
  const mockRequest = { user: mockUser } as unknown as JwtRequest;
  const mockMealId = 1;

  const mockMeal = {
    id: mockMealId,
    user_id: mockUser.id,
    name: 'Lunch',
    date: new Date('2023-12-08T12:00:00.000Z'),
    calories: 247.5,
    protein: 46.5,
    fats: 5.4,
    carbs: 0,
    meal_foods: [],
  };

  const mockMealsService = {
    findAll: jest.fn().mockResolvedValue([mockMeal]),
    findOne: jest.fn().mockResolvedValue(mockMeal),
    create: jest.fn().mockResolvedValue(mockMeal),
    update: jest.fn().mockResolvedValue(mockMeal),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealsController],
      providers: [
        {
          provide: MealsService,
          useValue: mockMealsService,
        },
      ],
    }).compile();

    controller = module.get<MealsController>(MealsController);
    service = module.get<MealsService>(MealsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of meals', async () => {
      const filter: GetMealsFilterDto = {
        start: '2023-12-08',
        end: '2023-12-14',
      };
      const result = await controller.findAll(mockRequest, filter);
      expect(result).toEqual([mockMeal]);
      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, filter);
    });
  });

  describe('findOne', () => {
    it('should return a single meal', async () => {
      const result = await controller.findOne(mockRequest, mockMealId);
      expect(result).toEqual(mockMeal);
      expect(service.findOne).toHaveBeenCalledWith(mockUser.id, mockMealId);
    });
  });

  describe('create', () => {
    it('should create a new meal', async () => {
      const dto: CreateMealDto = {
        name: 'Lunch',
        date: '2023-12-08T12:00:00Z',
        mealFoods: [],
      };
      const result = await controller.create(mockRequest, dto);
      expect(result).toEqual(mockMeal);
      expect(service.create).toHaveBeenCalledWith(mockUser.id, dto);
    });
  });

  describe('update', () => {
    it('should update an existing meal', async () => {
      const dto: UpdateMealDto = { name: 'Dinner' };
      const result = await controller.update(mockRequest, mockMealId, dto);
      expect(result).toEqual(mockMeal);
      expect(service.update).toHaveBeenCalledWith(mockUser.id, mockMealId, dto);
    });
  });

  describe('remove', () => {
    it('should remove a meal', async () => {
      await controller.remove(mockRequest, mockMealId);
      expect(service.remove).toHaveBeenCalledWith(mockUser.id, mockMealId);
    });
  });
});
