import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Sex } from 'src/generated/prisma/client';
import { JwtRequest } from 'src/auth/types/jwt-request.interface';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    avatar_url: 'http://example.com/avatar.png',
    sex: Sex.male,
    date_of_birth: new Date('1990-01-15T00:00:00.000Z'),
    device_serial_id: 'SN-12345',
  };

  const mockUsersService = {
    findOne: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should return the current user', async () => {
      const mockUserContext = { id: 1, email: 'test@example.com' };
      const mockReq = { user: mockUserContext } as unknown as JwtRequest;
      const result = await controller.getMe(mockReq);
      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(mockUserContext.id);
    });
  });

  describe('update', () => {
    it('should update the user', async () => {
      const dto: UpdateUserDto = { username: 'newname' };
      const result = await controller.update('1', dto);
      expect(result).toEqual(mockUser);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove the user', async () => {
      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
