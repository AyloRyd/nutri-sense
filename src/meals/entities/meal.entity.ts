import { ApiProperty } from '@nestjs/swagger';
import { MealFood } from 'src/generated/prisma/client';

export class MealFoodEntity implements MealFood {
  @ApiProperty()
  id: number;

  @ApiProperty()
  meal_id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  weight: number;

  @ApiProperty()
  calories: number;

  @ApiProperty()
  protein: number;

  @ApiProperty()
  fats: number;

  @ApiProperty()
  carbs: number;
}

export class MealEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  calories: number;

  @ApiProperty()
  protein: number;

  @ApiProperty()
  fats: number;

  @ApiProperty()
  carbs: number;

  @ApiProperty({ type: [MealFoodEntity] })
  meal_foods: MealFoodEntity[];
}
