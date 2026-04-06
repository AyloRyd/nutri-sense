import { ApiProperty } from '@nestjs/swagger';
import { TemplateMealFood } from 'src/generated/prisma/client';

export class TemplateMealFoodEntity implements TemplateMealFood {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  template_meal_id: number;

  @ApiProperty({ example: 'Chicken Breast' })
  name: string;

  @ApiProperty({ example: 150, description: 'Weight in grams' })
  weight: number;

  @ApiProperty({
    example: 247.5,
    description: 'Calculated calories for the specific weight',
  })
  calories: number;

  @ApiProperty({
    example: 46.5,
    description: 'Calculated protein for the specific weight',
  })
  protein: number;

  @ApiProperty({
    example: 5.4,
    description: 'Calculated fats for the specific weight',
  })
  fats: number;

  @ApiProperty({
    example: 0,
    description: 'Calculated carbs for the specific weight',
  })
  carbs: number;
}
