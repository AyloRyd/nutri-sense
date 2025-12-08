import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          username: createUserDto.username,
          avatar_url: createUserDto.avatar_url,
          hashed_password: await bcrypt.hash(createUserDto.password, 10),
        },
      }) as UserEntity;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }

      throw error;
    }
  }

  async findOne(id: number) {
    return await this.prisma.user.findUnique({ where: { id } }) as UserEntity;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      }) as UserEntity;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }

      throw error;
    }
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } }) as UserEntity;

    return { success: true };
  }
}
