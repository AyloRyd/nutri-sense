import { Test, TestingModule } from '@nestjs/testing';
import { TemplateFoodsService } from './template-foods.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TemplateFoodsService', () => {
  let service: TemplateFoodsService;

  const mockPrismaService = {
    templateFood: {
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
        TemplateFoodsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TemplateFoodsService>(TemplateFoodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
