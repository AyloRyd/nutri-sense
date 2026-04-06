import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { PlansService } from '../plans/plans.service';
import { MealsService } from '../meals/meals.service';

describe('StatsService', () => {
  let service: StatsService;

  const mockPlansService = {
    findActiveByDate: jest.fn(),
  };

  const mockMealsService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: PlansService, useValue: mockPlansService },
        { provide: MealsService, useValue: mockMealsService },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
