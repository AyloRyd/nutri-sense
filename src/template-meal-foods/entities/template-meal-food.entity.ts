import { ApiProperty } from '@nestjs/swagger';
import { TemplateMealFood } from 'src/generated/prisma/client';

export class TemplateMealFoodEntity implements TemplateMealFood {
  @ApiProperty()
  id: number;

  @ApiProperty()
  template_meal_id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  weight: number;

  @ApiProperty({
    description: 'Calculated calories for the specific weight',
  })
  calories: number;

  @ApiProperty({
    description: 'Calculated protein for the specific weight',
  })
  protein: number;

  @ApiProperty({ description: 'Calculated fats for the specific weight' })
  fats: number;

  @ApiProperty({ description: 'Calculated carbs for the specific weight' })
  carbs: number;
}
