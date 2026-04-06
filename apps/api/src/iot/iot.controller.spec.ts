import { Test, TestingModule } from '@nestjs/testing';
import { IotController } from './iot.controller';
import { IotService } from './iot.service';

describe('IotController', () => {
  let controller: IotController;

  const mockIotService = {
    linkDevice: jest.fn(),
    unlinkDevice: jest.fn(),
    getDeviceStatus: jest.fn(),
    getCurrentWeight: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IotController],
      providers: [
        {
          provide: IotService,
          useValue: mockIotService,
        },
      ],
    }).compile();

    controller = module.get<IotController>(IotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
