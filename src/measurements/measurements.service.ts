import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';

@Injectable()
export class MeasurementsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.userMeasurement.findMany({
      where: { user_id: userId },
      orderBy: { date: 'desc' },
    });
  }

  async findCurrent(userId: number) {
    const current = await this.prisma.userMeasurement.findFirst({
      where: { user_id: userId },
      orderBy: { date: 'desc' },
    });

    return current;
  }

  async create(userId: number, dto: CreateMeasurementDto) {
    return this.prisma.userMeasurement.create({
      data: {
        user_id: userId,
        weight: dto.weight,
        height: dto.height,
        activity: dto.activity,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
  }

  async update(userId: number, id: number, dto: UpdateMeasurementDto) {
    const measurement = await this.prisma.userMeasurement.findUnique({
      where: { id },
    });

    if (!measurement) {
      throw new NotFoundException(`Measurement #${id} not found`);
    }

    if (measurement.user_id !== userId) {
      throw new ForbiddenException('Access denied to this measurement');
    }

    return this.prisma.userMeasurement.update({
      where: { id },
      data: {
        weight: dto.weight,
        height: dto.height,
        activity: dto.activity,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(userId: number, id: number) {
    const measurement = await this.prisma.userMeasurement.findUnique({
      where: { id },
    });

    if (!measurement) {
      throw new NotFoundException(`Measurement #${id} not found`);
    }

    if (measurement.user_id !== userId) {
      throw new ForbiddenException('Access denied to this measurement');
    }

    return this.prisma.userMeasurement.delete({
      where: { id },
    });
  }
}
