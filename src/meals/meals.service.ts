import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { GetMealsFilterDto } from './dto/get-meals-filter.dto';
import { MealEntity } from './entities/meal.entity';
import { CreateMealFoodDto } from 'src/meal-foods/dto/create-meal-food.dto';

@Injectable()
export class MealsService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateFoodMacros(food: CreateMealFoodDto) {
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

  private enrichMealWithTotals(meal: any): MealEntity {
    const totals = meal.meal_foods.reduce(
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

  async create(userId: number, dto: CreateMealDto) {
    const calculatedFoods = dto.mealFoods.map((food) =>
      this.calculateFoodMacros(food),
    );

    const meal = await this.prisma.meal.create({
      data: {
        user_id: userId,
        name: dto.name,
        date: new Date(dto.date),
        meal_foods: {
          create: calculatedFoods,
        },
      },
      include: {
        meal_foods: true,
      },
    });

    return this.enrichMealWithTotals(meal);
  }

  async findAll(userId: number, filter: GetMealsFilterDto) {
    const startDate = new Date(filter.start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(filter.end);
    endDate.setHours(23, 59, 59, 999);

    const meals = await this.prisma.meal.findMany({
      where: {
        user_id: userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        meal_foods: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return meals.map((meal) => this.enrichMealWithTotals(meal));
  }

  async findOne(userId: number, id: number) {
    const meal = await this.prisma.meal.findUnique({
      where: { id },
      include: { meal_foods: true },
    });

    if (!meal) {
      throw new NotFoundException(`Meal #${id} not found`);
    }

    if (meal.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.enrichMealWithTotals(meal);
  }

  async update(userId: number, id: number, dto: UpdateMealDto) {
    await this.findOne(userId, id); 

    return this.prisma.$transaction(async (prisma) => {
      const updateData: any = {};

      if (dto.name) {
        updateData.name = dto.name;
      }

      if (dto.date) {
        updateData.date = new Date(dto.date);
      }

      if (dto.mealFoods) {
        await prisma.mealFood.deleteMany({
          where: { meal_id: id },
        });

        const calculatedFoods = dto.mealFoods.map((food) =>
          this.calculateFoodMacros(food),
        );

        updateData.meal_foods = {
          create: calculatedFoods,
        };
      }

      const updatedMeal = await prisma.meal.update({
        where: { id },
        data: updateData,
        include: {
          meal_foods: true,
        },
      });

      return this.enrichMealWithTotals(updatedMeal);
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);

    return await this.prisma.$transaction(async (prisma) => {
      await prisma.mealFood.deleteMany({
        where: { meal_id: id },
      });
      await prisma.meal.delete({
        where: { id },
      });
    });
  }
}
