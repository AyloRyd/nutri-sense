import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMealFoodDto } from './dto/create-meal-food.dto';
import { UpdateMealFoodDto } from './dto/update-meal-food.dto';

@Injectable()
export class MealFoodsService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateMacros(
    dto: CreateMealFoodDto | UpdateMealFoodDto,
    currentWeight?: number,
  ) {
    const weight = dto.weight || currentWeight || 0;
    const ratio = weight / 100;

    return {
      name: dto.name,
      weight: dto.weight,
      calories:
        dto.calories !== undefined
          ? parseFloat((dto.calories * ratio).toFixed(2))
          : undefined,
      protein:
        dto.protein !== undefined
          ? parseFloat((dto.protein * ratio).toFixed(2))
          : undefined,
      fats:
        dto.fats !== undefined
          ? parseFloat((dto.fats * ratio).toFixed(2))
          : undefined,
      carbs:
        dto.carbs !== undefined
          ? parseFloat((dto.carbs * ratio).toFixed(2))
          : undefined,
    };
  }

  private async verifyMealOwnership(userId: number, mealId: number) {
    const meal = await this.prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) throw new NotFoundException(`Meal #${mealId} not found`);
    if (meal.user_id !== userId)
      throw new ForbiddenException('Access denied to this meal');
    return meal;
  }

  async findAll(userId: number, mealId: number) {
    await this.verifyMealOwnership(userId, mealId);
    return this.prisma.mealFood.findMany({
      where: { meal_id: mealId },
    });
  }

  async findOne(userId: number, mealId: number, id: number) {
    await this.verifyMealOwnership(userId, mealId);

    const food = await this.prisma.mealFood.findFirst({
      where: { id, meal_id: mealId },
    });

    if (!food)
      throw new NotFoundException(`Food #${id} not found in meal #${mealId}`);
    return food;
  }

  async create(userId: number, mealId: number, dto: CreateMealFoodDto) {
    await this.verifyMealOwnership(userId, mealId);

    const ratio = dto.weight / 100;

    return this.prisma.mealFood.create({
      data: {
        meal_id: mealId,
        name: dto.name,
        weight: dto.weight,
        calories: parseFloat((dto.calories * ratio).toFixed(2)),
        protein: parseFloat((dto.protein * ratio).toFixed(2)),
        fats: parseFloat((dto.fats * ratio).toFixed(2)),
        carbs: parseFloat((dto.carbs * ratio).toFixed(2)),
      },
    });
  }

  async update(
    userId: number,
    mealId: number,
    id: number,
    dto: UpdateMealFoodDto,
  ) {
    await this.verifyMealOwnership(userId, mealId);

    const existingFood = await this.prisma.mealFood.findFirst({
      where: { id, meal_id: mealId },
    });

    if (!existingFood) throw new NotFoundException(`Food #${id} not found`);

    const newWeight = dto.weight ?? existingFood.weight;
    const ratio = newWeight / 100;

    const data: any = {};
    if (dto.name) data.name = dto.name;
    if (dto.weight) data.weight = dto.weight;

    if (dto.calories !== undefined)
      data.calories = parseFloat((dto.calories * ratio).toFixed(2));
    if (dto.protein !== undefined)
      data.protein = parseFloat((dto.protein * ratio).toFixed(2));
    if (dto.fats !== undefined)
      data.fats = parseFloat((dto.fats * ratio).toFixed(2));
    if (dto.carbs !== undefined)
      data.carbs = parseFloat((dto.carbs * ratio).toFixed(2));

    return this.prisma.mealFood.update({
      where: { id },
      data,
    });
  }

  async remove(userId: number, mealId: number, id: number) {
    await this.verifyMealOwnership(userId, mealId);

    const food = await this.prisma.mealFood.findFirst({
      where: { id, meal_id: mealId },
    });

    if (!food) throw new NotFoundException(`Food #${id} not found`);

    return this.prisma.mealFood.delete({
      where: { id },
    });
  }
}
