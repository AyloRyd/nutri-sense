import { Test, TestingModule } from '@nestjs/testing';
import { IotService } from './iot.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

jest.mock('mqtt', () => ({
  connect: jest.fn().mockReturnValue({
    on: jest.fn(),
    subscribe: jest.fn(),
    publish: jest.fn(),
    unsubscribe: jest.fn(),
    removeListener: jest.fn(),
  }),
}));

describe('IotService', () => {
  let service: IotService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'MQTT_HOST') return 'localhost';
      if (key === 'MQTT_PORT') return 1883;
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IotService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<IotService>(IotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
