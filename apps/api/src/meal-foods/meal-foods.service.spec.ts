import { Test, TestingModule } from '@nestjs/testing';
import { MealFoodsService } from './meal-foods.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MealFoodsService', () => {
  let service: MealFoodsService;

  const mockPrismaService = {
    meal: { findUnique: jest.fn() },
    mealFood: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealFoodsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MealFoodsService>(MealFoodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
