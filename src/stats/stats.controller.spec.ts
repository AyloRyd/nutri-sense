import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { GetStatsFilterDto } from './dto/get-stats-filter.dto';

import { JwtRequest } from 'src/auth/types/jwt-request.interface';

describe('StatsController', () => {
  let controller: StatsController;
  let service: StatsService;

  const mockUser = { id: 1, email: 'test@example.com' };
  const mockRequest = { user: mockUser } as unknown as JwtRequest;

  const mockDailyStat = {
    date: '2023-12-08',
    plan: {
      id: 1,
      user_id: mockUser.id,
      start_date: new Date('2023-12-08T00:00:00.000Z'),
      plan: 'maintain',
      day_calories: 2200,
      day_protein: 150,
      day_fats: 73,
      day_carbs: 275,
    },
    actual_calories: 1850,
    actual_protein: 120,
    actual_fats: 65,
    actual_carbs: 210,
  };

  const mockStatsService = {
    getStats: jest.fn().mockResolvedValue([mockDailyStat]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        {
          provide: StatsService,
          useValue: mockStatsService,
        },
      ],
    }).compile();

    controller = module.get<StatsController>(StatsController);
    service = module.get<StatsService>(StatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStats', () => {
    it('should return an array of daily stats', async () => {
      const filter: GetStatsFilterDto = {
        start: '2023-12-01',
        end: '2023-12-07',
      };
      const result = await controller.getStats(mockRequest, filter);
      expect(result).toEqual([mockDailyStat]);
      expect(service.getStats).toHaveBeenCalledWith(mockUser.id, filter);
    });
  });
});
