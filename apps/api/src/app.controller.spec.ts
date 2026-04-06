import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest
              .fn()
              .mockReturnValue('<html>NutriSense API /scalar /swagger</html>'),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return HTML containing NutriSense API info', () => {
      const result = appController.getHello();
      expect(result).toContain('NutriSense');
      expect(result).toContain('/scalar');
      expect(result).toContain('/swagger');
      expect(appService.getHello).toHaveBeenCalled();
    });
  });
});
