import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanGoal, Sex } from 'src/generated/prisma/enums';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.plan.findMany({
      where: { user_id: userId },
      orderBy: { start_date: 'desc' },
    });
  }

  async findActiveByDate(userId: number, dateStr: string) {
    const queryDate = new Date(dateStr);

    const plan = await this.prisma.plan.findFirst({
      where: {
        user_id: userId,
        start_date: {
          lte: queryDate,
        },
      },
      orderBy: {
        start_date: 'desc',
      },
    });

    if (!plan) {
      throw new NotFoundException(`No active plan found for date ${dateStr}`);
    }
    return plan;
  }

  async create(userId: number, dto: CreatePlanDto) {
    let macros = {
      day_calories: dto.day_calories,
      day_protein: dto.day_protein,
      day_fats: dto.day_fats,
      day_carbs: dto.day_carbs,
    };

    if (
      !macros.day_calories ||
      !macros.day_protein ||
      !macros.day_fats ||
      !macros.day_carbs
    ) {
      if (!dto.goal) {
        throw new BadRequestException(
          'Goal is required if macros are not manually provided',
        );
      }
      macros = await this.calculateMacros(userId, dto.goal);
    }

    return this.prisma.plan.create({
      data: {
        user_id: userId,
        start_date: new Date(dto.start_date),
        plan: dto.goal || PlanGoal.maintain,
        day_calories: macros.day_calories!,
        day_protein: macros.day_protein!,
        day_fats: macros.day_fats!,
        day_carbs: macros.day_carbs!,
      },
    });
  }

  async update(userId: number, planId: number, dto: UpdatePlanDto) {
    const existingPlan = await this.prisma.plan.findFirst({
      where: { id: planId, user_id: userId },
    });

    if (!existingPlan) {
      throw new NotFoundException(`Plan #${planId} not found`);
    }

    const goalToUse = dto.goal || existingPlan.plan;

    let macros = {
      day_calories: dto.day_calories ?? existingPlan.day_calories,
      day_protein: dto.day_protein ?? existingPlan.day_protein,
      day_fats: dto.day_fats ?? existingPlan.day_fats,
      day_carbs: dto.day_carbs ?? existingPlan.day_carbs,
    };

    const isManualUpdate =
      dto.day_calories || dto.day_protein || dto.day_fats || dto.day_carbs;

    if (dto.goal && !isManualUpdate) {
      macros = await this.calculateMacros(userId, goalToUse);
    }

    return this.prisma.plan.update({
      where: { id: planId },
      data: {
        start_date: dto.start_date ? new Date(dto.start_date) : undefined,
        plan: goalToUse,
        ...macros,
      },
    });
  }

  private async calculateMacros(userId: number, goal: PlanGoal) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { sex: true, date_of_birth: true },
    });

    if (!user || !user.sex || !user.date_of_birth) {
      throw new BadRequestException(
        'User profile incomplete (Sex or Date of Birth missing). Please update profile first.',
      );
    }

    const measurement = await this.prisma.userMeasurement.findFirst({
      where: { user_id: userId },
      orderBy: { date: 'desc' },
    });

    if (!measurement) {
      throw new BadRequestException(
        'No measurements found. Please add weight/height/activity first.',
      );
    }

    const today = new Date();
    let age = today.getFullYear() - user.date_of_birth.getFullYear();
    const m = today.getMonth() - user.date_of_birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < user.date_of_birth.getDate())) {
      age--;
    }

    let bmr = 10 * measurement.weight + 6.25 * measurement.height - 5 * age;

    if (user.sex === Sex.male) {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const maintainCalories = bmr * measurement.activity;

    let targetCalories = maintainCalories;
    if (goal === PlanGoal.lose) {
      targetCalories = maintainCalories * 0.8;
    } else if (goal === PlanGoal.gain) {
      targetCalories = maintainCalories * 1.15;
    }

    const proteinGrams = measurement.weight * 2;
    const fatsGrams = measurement.weight * 0.9;

    const proteinKcal = proteinGrams * 4;
    const fatsKcal = fatsGrams * 9;

    const remainingForCarbs = targetCalories - (proteinKcal + fatsKcal);
    const carbsGrams = remainingForCarbs > 0 ? remainingForCarbs / 4 : 0;

    return {
      day_calories: Math.round(targetCalories),
      day_protein: Math.round(proteinGrams),
      day_fats: Math.round(fatsGrams),
      day_carbs: Math.round(carbsGrams),
    };
  }
}
