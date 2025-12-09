import { ApiProperty } from '@nestjs/swagger';
import { TemplateMealFoodEntity } from 'src/template-meal-foods/entities/template-meal-food.entity';

export class TemplateMealEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  calories: number;

  @ApiProperty()
  protein: number;

  @ApiProperty()
  fats: number;

  @ApiProperty()
  carbs: number;

  @ApiProperty({ type: [TemplateMealFoodEntity] })
  template_meal_foods: TemplateMealFoodEntity[];
}