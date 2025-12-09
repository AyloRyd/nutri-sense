import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTemplateFoodDto } from './dto/create-template-food.dto';
import { UpdateTemplateFoodDto } from './dto/update-template-food.dto';

@Injectable()
export class TemplateFoodsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.templateFood.findMany({
      where: { user_id: userId },
    });
  }

  async findOne(userId: number, id: number) {
    const food = await this.prisma.templateFood.findFirst({
      where: { id, user_id: userId },
    });

    if (!food) {
      throw new NotFoundException(`Template Food #${id} not found`);
    }

    return food;
  }

  async create(userId: number, dto: CreateTemplateFoodDto) {
    return this.prisma.templateFood.create({
      data: {
        user_id: userId,
        ...dto,
      },
    });
  }

  async update(userId: number, id: number, dto: UpdateTemplateFoodDto) {
    await this.findOne(userId, id);

    return this.prisma.templateFood.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);

    return this.prisma.templateFood.delete({
      where: { id },
    });
  }
}
