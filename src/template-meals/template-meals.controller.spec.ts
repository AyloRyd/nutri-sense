import { Test, TestingModule } from '@nestjs/testing';
import { TemplateMealsController } from './template-meals.controller';
import { TemplateMealsService } from './template-meals.service';
import { CreateTemplateMealDto } from './dto/create-template-meal.dto';
import { UpdateTemplateMealDto } from './dto/update-template-meal.dto';

import { JwtRequest } from 'src/auth/types/jwt-request.interface';

describe('TemplateMealsController', () => {
  let controller: TemplateMealsController;
  let service: TemplateMealsService;

  const mockUser = { id: 1, email: 'test@example.com' };
  const mockRequest = { user: mockUser } as unknown as JwtRequest;
  const mockTemplateMealId = 1;

  const mockTemplateMeal = {
    id: mockTemplateMealId,
    user_id: mockUser.id,
    name: 'My Breakfast Template',
    calories: 247.5,
    protein: 46.5,
    fats: 5.4,
    carbs: 0,
    template_meal_foods: [],
  };

  const mockTemplateMealsService = {
    findAll: jest.fn().mockResolvedValue([mockTemplateMeal]),
    findOne: jest.fn().mockResolvedValue(mockTemplateMeal),
    create: jest.fn().mockResolvedValue(mockTemplateMeal),
    update: jest.fn().mockResolvedValue(mockTemplateMeal),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateMealsController],
      providers: [
        {
          provide: TemplateMealsService,
          useValue: mockTemplateMealsService,
        },
      ],
    }).compile();

    controller = module.get<TemplateMealsController>(TemplateMealsController);
    service = module.get<TemplateMealsService>(TemplateMealsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of template meals', async () => {
      const result = await controller.findAll(mockRequest);
      expect(result).toEqual([mockTemplateMeal]);
      expect(service.findAll).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should return a single template meal', async () => {
      const result = await controller.findOne(mockRequest, mockTemplateMealId);
      expect(result).toEqual(mockTemplateMeal);
      expect(service.findOne).toHaveBeenCalledWith(
        mockUser.id,
        mockTemplateMealId,
      );
    });
  });

  describe('create', () => {
    it('should create a new template meal', async () => {
      const dto: CreateTemplateMealDto = {
        name: 'My Breakfast Template',
        templateMealFoods: [],
      };
      const result = await controller.create(mockRequest, dto);
      expect(result).toEqual(mockTemplateMeal);
      expect(service.create).toHaveBeenCalledWith(mockUser.id, dto);
    });
  });

  describe('update', () => {
    it('should update an existing template meal', async () => {
      const dto: UpdateTemplateMealDto = { name: 'Updated Template' };
      const result = await controller.update(
        mockRequest,
        mockTemplateMealId,
        dto,
      );
      expect(result).toEqual(mockTemplateMeal);
      expect(service.update).toHaveBeenCalledWith(
        mockUser.id,
        mockTemplateMealId,
        dto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a template meal', async () => {
      await controller.remove(mockRequest, mockTemplateMealId);
      expect(service.remove).toHaveBeenCalledWith(
        mockUser.id,
        mockTemplateMealId,
      );
    });
  });
});
