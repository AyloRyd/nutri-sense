import { Test, TestingModule } from '@nestjs/testing';
import { TemplateMealFoodsService } from './template-meal-foods.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TemplateMealFoodsService', () => {
  let service: TemplateMealFoodsService;

  const mockPrismaService = {
    templateMeal: { findUnique: jest.fn() },
    templateMealFood: {
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
        TemplateMealFoodsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TemplateMealFoodsService>(TemplateMealFoodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
