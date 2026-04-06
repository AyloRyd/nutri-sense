import { Test, TestingModule } from '@nestjs/testing';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanGoal } from 'src/generated/prisma/enums';

import { JwtRequest } from 'src/auth/types/jwt-request.interface';

describe('PlansController', () => {
  let controller: PlansController;
  let service: PlansService;

  const mockUser = { id: 1, email: 'test@example.com' };
  const mockRequest = { user: mockUser } as unknown as JwtRequest;
  const mockPlanId = 1;

  const mockPlan = {
    id: mockPlanId,
    user_id: mockUser.id,
    start_date: new Date('2023-12-08T00:00:00.000Z'),
    plan: PlanGoal.maintain,
    day_calories: 2200,
    day_protein: 150,
    day_fats: 73,
    day_carbs: 275,
  };

  const mockPlansService = {
    findAll: jest.fn().mockResolvedValue([mockPlan]),
    findActiveByDate: jest.fn().mockResolvedValue(mockPlan),
    create: jest.fn().mockResolvedValue(mockPlan),
    update: jest.fn().mockResolvedValue(mockPlan),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlansController],
      providers: [
        {
          provide: PlansService,
          useValue: mockPlansService,
        },
      ],
    }).compile();

    controller = module.get<PlansController>(PlansController);
    service = module.get<PlansService>(PlansService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of plans', async () => {
      const result = await controller.findAll(mockRequest);
      expect(result).toEqual([mockPlan]);
      expect(service.findAll).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findCurrent', () => {
    it('should return the current active plan', async () => {
      const result = await controller.findCurrent(mockRequest);
      expect(result).toEqual(mockPlan);
      expect(service.findActiveByDate).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String),
      );
    });
  });

  describe('findByDate', () => {
    it('should return the active plan for a specific date', async () => {
      const date = '2023-12-08';
      const result = await controller.findByDate(mockRequest, date);
      expect(result).toEqual(mockPlan);
      expect(service.findActiveByDate).toHaveBeenCalledWith(mockUser.id, date);
    });
  });

  describe('create', () => {
    it('should create a new plan', async () => {
      const dto: CreatePlanDto = {
        start_date: '2023-12-08T00:00:00Z',
        goal: PlanGoal.maintain,
        day_calories: 2200,
        day_protein: 150,
        day_fats: 73,
        day_carbs: 275,
      };
      const result = await controller.create(mockRequest, dto);
      expect(result).toEqual(mockPlan);
      expect(service.create).toHaveBeenCalledWith(mockUser.id, dto);
    });
  });

  describe('update', () => {
    it('should update an existing plan', async () => {
      const dto: UpdatePlanDto = { day_calories: 2500 };
      const result = await controller.update(mockRequest, mockPlanId, dto);
      expect(result).toEqual(mockPlan);
      expect(service.update).toHaveBeenCalledWith(mockUser.id, mockPlanId, dto);
    });
  });
});
