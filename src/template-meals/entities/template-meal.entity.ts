import { ApiProperty } from '@nestjs/swagger';
import { TemplateMealFoodEntity } from 'src/template-meal-foods/entities/template-meal-food.entity';

export class TemplateMealEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  user_id: number;

  @ApiProperty({ example: 'My Breakfast Template' })
  name: string;

  @ApiProperty({ example: 247.5, description: 'Sum of template meal foods' })
  calories: number;

  @ApiProperty({ example: 46.5 })
  protein: number;

  @ApiProperty({ example: 5.4 })
  fats: number;

  @ApiProperty({ example: 0 })
  carbs: number;

  @ApiProperty({ type: [TemplateMealFoodEntity] })
  template_meal_foods: TemplateMealFoodEntity[];
}
