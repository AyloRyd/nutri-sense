import { ApiProperty } from '@nestjs/swagger';
import { MealFoodEntity } from 'src/meal-foods/entities/meal-food.entity';

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
