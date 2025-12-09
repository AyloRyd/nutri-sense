import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTemplateMealFoodDto } from './dto/create-template-meal-food.dto';
import { UpdateTemplateMealFoodDto } from './dto/update-template-meal-food.dto';

@Injectable()
export class TemplateMealFoodsService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateMacros(
    dto: CreateTemplateMealFoodDto | UpdateTemplateMealFoodDto,
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

  private async verifyTemplateMealOwnership(
    userId: number,
    templateMealId: number,
  ) {
    const templateMeal = await this.prisma.templateMeal.findUnique({
      where: { id: templateMealId },
    });
    if (!templateMeal)
      throw new NotFoundException(`Template Meal #${templateMealId} not found`);
    if (templateMeal.user_id !== userId)
      throw new ForbiddenException('Access denied to this template meal');
    return templateMeal;
  }

  async findAll(userId: number, templateMealId: number) {
    await this.verifyTemplateMealOwnership(userId, templateMealId);
    return this.prisma.templateMealFood.findMany({
      where: { template_meal_id: templateMealId },
    });
  }

  async findOne(userId: number, templateMealId: number, id: number) {
    await this.verifyTemplateMealOwnership(userId, templateMealId);
    const food = await this.prisma.templateMealFood.findFirst({
      where: { id, template_meal_id: templateMealId },
    });
    if (!food)
      throw new NotFoundException(
        `Food #${id} not found in template meal #${templateMealId}`,
      );
    return food;
  }

  async create(
    userId: number,
    templateMealId: number,
    dto: CreateTemplateMealFoodDto,
  ) {
    await this.verifyTemplateMealOwnership(userId, templateMealId);
    const ratio = dto.weight / 100;

    return this.prisma.templateMealFood.create({
      data: {
        template_meal_id: templateMealId,
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
    templateMealId: number,
    id: number,
    dto: UpdateTemplateMealFoodDto,
  ) {
    await this.verifyTemplateMealOwnership(userId, templateMealId);
    const existingFood = await this.prisma.templateMealFood.findFirst({
      where: { id, template_meal_id: templateMealId },
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

    return this.prisma.templateMealFood.update({
      where: { id },
      data,
    });
  }

  async remove(userId: number, templateMealId: number, id: number) {
    await this.verifyTemplateMealOwnership(userId, templateMealId);
    const food = await this.prisma.templateMealFood.findFirst({
      where: { id, template_meal_id: templateMealId },
    });
    if (!food) throw new NotFoundException(`Food #${id} not found`);

    return this.prisma.templateMealFood.delete({
      where: { id },
    });
  }
}
