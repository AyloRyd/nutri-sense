import { Test, TestingModule } from '@nestjs/testing';
import { MeasurementsController } from './measurements.controller';
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';

import { JwtRequest } from 'src/auth/types/jwt-request.interface';

describe('MeasurementsController', () => {
  let controller: MeasurementsController;
  let service: MeasurementsService;

  const mockUser = { id: 1, email: 'test@example.com' };
  const mockRequest = { user: mockUser } as unknown as JwtRequest;
  const mockMeasurementId = 1;

  const mockMeasurement = {
    id: mockMeasurementId,
    user_id: mockUser.id,
    date: new Date('2023-12-08T10:00:00.000Z'),
    weight: 75.5,
    height: 180,
    activity: 1.2,
  };

  const mockMeasurementsService = {
    findAll: jest.fn().mockResolvedValue([mockMeasurement]),
    findCurrent: jest.fn().mockResolvedValue(mockMeasurement),
    create: jest.fn().mockResolvedValue(mockMeasurement),
    update: jest.fn().mockResolvedValue(mockMeasurement),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeasurementsController],
      providers: [
        {
          provide: MeasurementsService,
          useValue: mockMeasurementsService,
        },
      ],
    }).compile();

    controller = module.get<MeasurementsController>(MeasurementsController);
    service = module.get<MeasurementsService>(MeasurementsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of measurements', async () => {
      const result = await controller.findAll(mockRequest);
      expect(result).toEqual([mockMeasurement]);
      expect(service.findAll).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findCurrent', () => {
    it('should return the current measurement', async () => {
      const result = await controller.findCurrent(mockRequest);
      expect(result).toEqual(mockMeasurement);
      expect(service.findCurrent).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('create', () => {
    it('should create a new measurement', async () => {
      const dto: CreateMeasurementDto = {
        weight: 75.5,
        height: 180,
        activity: 1.2,
      };
      const result = await controller.create(mockRequest, dto);
      expect(result).toEqual(mockMeasurement);
      expect(service.create).toHaveBeenCalledWith(mockUser.id, dto);
    });
  });

  describe('update', () => {
    it('should update an existing measurement', async () => {
      const dto: UpdateMeasurementDto = { weight: 70 };
      const result = await controller.update(
        mockRequest,
        mockMeasurementId,
        dto,
      );
      expect(result).toEqual(mockMeasurement);
      expect(service.update).toHaveBeenCalledWith(
        mockUser.id,
        mockMeasurementId,
        dto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a measurement', async () => {
      await controller.remove(mockRequest, mockMeasurementId);
      expect(service.remove).toHaveBeenCalledWith(
        mockUser.id,
        mockMeasurementId,
      );
    });
  });
});
