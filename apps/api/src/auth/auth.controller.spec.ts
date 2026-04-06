import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtRequest } from './types/jwt-request.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthEntity = {
    access_token: 'mock_token',
  };

  const mockAuthService = {
    register: jest.fn().mockResolvedValue(mockAuthEntity),
    login: jest.fn().mockResolvedValue(mockAuthEntity),
    changePassword: jest
      .fn()
      .mockResolvedValue({ message: 'Password changed successfully' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };
      const result = await controller.register(dto);
      expect(result).toEqual(mockAuthEntity);
      expect(service.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = await controller.login(dto);
      expect(result).toEqual(mockAuthEntity);
      expect(service.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockRequest = { user: mockUser } as unknown as JwtRequest;
      const dto: ChangePasswordDto = {
        password: 'oldPassword123',
        new_password: 'newPassword123',
      };
      const result = await controller.changePassword(mockRequest, dto);
      expect(result).toEqual({ message: 'Password changed successfully' });
      expect(service.changePassword).toHaveBeenCalledWith(
        mockUser.id,
        dto.password,
        dto.new_password,
      );
    });
  });
});
