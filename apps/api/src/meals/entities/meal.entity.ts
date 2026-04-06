import { ApiProperty } from '@nestjs/swagger';
import { MealFoodEntity } from 'src/meal-foods/entities/meal-food.entity';

export class MealEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  user_id: number;

  @ApiProperty({ example: 'Lunch' })
  name: string;

  @ApiProperty({ example: '2023-12-08T12:00:00.000Z' })
  date: Date;

  @ApiProperty({ example: 247.5, description: 'Sum of meal foods calories' })
  calories: number;

  @ApiProperty({ example: 46.5, description: 'Sum of meal foods protein' })
  protein: number;

  @ApiProperty({ example: 5.4, description: 'Sum of meal foods fats' })
  fats: number;

  @ApiProperty({ example: 0, description: 'Sum of meal foods carbs' })
  carbs: number;

  @ApiProperty({ type: [MealFoodEntity] })
  meal_foods: MealFoodEntity[];
}
