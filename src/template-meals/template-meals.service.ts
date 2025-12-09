import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTemplateMealDto } from './dto/create-template-meal.dto';
import { UpdateTemplateMealDto } from './dto/update-template-meal.dto';
import { TemplateMealEntity } from './entities/template-meal.entity';
import { CreateTemplateMealFoodDto } from 'src/template-meal-foods/dto/create-template-meal-food.dto';

@Injectable()
export class TemplateMealsService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateFoodMacros(food: CreateTemplateMealFoodDto) {
    const ratio = food.weight / 100;
    return {
      name: food.name,
      weight: food.weight,
      calories: parseFloat((food.calories * ratio).toFixed(2)),
      protein: parseFloat((food.protein * ratio).toFixed(2)),
      fats: parseFloat((food.fats * ratio).toFixed(2)),
      carbs: parseFloat((food.carbs * ratio).toFixed(2)),
    };
  }

  private enrichTemplateMealWithTotals(meal: any): TemplateMealEntity {
    const foods = meal.template_meal_foods || [];
    const totals = foods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        fats: acc.fats + food.fats,
        carbs: acc.carbs + food.carbs,
      }),
      { calories: 0, protein: 0, fats: 0, carbs: 0 },
    );

    return {
      ...meal,
      calories: parseFloat(totals.calories.toFixed(2)),
      protein: parseFloat(totals.protein.toFixed(2)),
      fats: parseFloat(totals.fats.toFixed(2)),
      carbs: parseFloat(totals.carbs.toFixed(2)),
    };
  }

  async create(userId: number, dto: CreateTemplateMealDto) {
    const calculatedFoods = dto.templateMealFoods.map((food) =>
      this.calculateFoodMacros(food),
    );

    const templateMeal = await this.prisma.templateMeal.create({
      data: {
        user_id: userId,
        name: dto.name,
        template_meal_foods: {
          create: calculatedFoods,
        },
      },
      include: {
        template_meal_foods: true,
      },
    });

    return this.enrichTemplateMealWithTotals(templateMeal);
  }

  async findAll(userId: number) {
    const templateMeals = await this.prisma.templateMeal.findMany({
      where: {
        user_id: userId,
      },
      include: {
        template_meal_foods: true,
      },
      orderBy: {
        id: 'desc', // No date, so we sort by ID
      },
    });

    return templateMeals.map((meal) => this.enrichTemplateMealWithTotals(meal));
  }

  async findOne(userId: number, id: number) {
    const templateMeal = await this.prisma.templateMeal.findUnique({
      where: { id },
      include: { template_meal_foods: true },
    });

    if (!templateMeal) {
      throw new NotFoundException(`Template Meal #${id} not found`);
    }

    if (templateMeal.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.enrichTemplateMealWithTotals(templateMeal);
  }

  async update(userId: number, id: number, dto: UpdateTemplateMealDto) {
    await this.findOne(userId, id);

    return this.prisma.$transaction(async (prisma) => {
      const updateData: any = {};

      if (dto.name) {
        updateData.name = dto.name;
      }

      if (dto.templateMealFoods) {
        await prisma.templateMealFood.deleteMany({
          where: { template_meal_id: id },
        });

        const calculatedFoods = dto.templateMealFoods.map((food) =>
          this.calculateFoodMacros(food),
        );

        updateData.template_meal_foods = {
          create: calculatedFoods,
        };
      }

      const updatedTemplateMeal = await prisma.templateMeal.update({
        where: { id },
        data: updateData,
        include: {
          template_meal_foods: true,
        },
      });

      return this.enrichTemplateMealWithTotals(updatedTemplateMeal);
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);

    return await this.prisma.$transaction(async (prisma) => {
      await prisma.templateMealFood.deleteMany({
        where: { template_meal_id: id },
      });
      await prisma.templateMeal.delete({
        where: { id },
      });
    });
  }
}
