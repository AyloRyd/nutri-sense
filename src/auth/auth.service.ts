import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entity/auth.entity';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);

    try {
      return await this.login({
        email: registerDto.email,
        password: registerDto.password,
      });
    } catch (error) {
      await this.prisma.user.delete({ where: { id: user.id } });
      throw error;
    }
  }

  async login({ email, password }: LoginDto): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.hashed_password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return {
      access_token: this.jwtService.sign({ userId: user.id }),
    };
  }

  async changePassword(userId: number, password: string, new_password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(password, user.hashed_password);

    if (!isValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    const newHashedPassword = await bcrypt.hash(new_password, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashed_password: newHashedPassword,
      },
    });

    return { success: true };
  }
}
