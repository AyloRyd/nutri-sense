import { Test, TestingModule } from '@nestjs/testing';
import { TemplateMealsService } from './template-meals.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TemplateMealsService', () => {
  let service: TemplateMealsService;

  const mockPrismaService = {
    templateMeal: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateMealsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TemplateMealsService>(TemplateMealsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
