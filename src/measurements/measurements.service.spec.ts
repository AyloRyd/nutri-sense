import { Test, TestingModule } from '@nestjs/testing';
import { MeasurementsService } from './measurements.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MeasurementsService', () => {
  let service: MeasurementsService;

  const mockPrismaService = {
    measurement: {
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
        MeasurementsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MeasurementsService>(MeasurementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
