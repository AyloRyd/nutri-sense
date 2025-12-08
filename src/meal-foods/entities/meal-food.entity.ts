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

  @ApiProperty({ description: 'Calculated calories for the specific weight' })
  calories: number;

  @ApiProperty({ description: 'Calculated protein for the specific weight' })
  protein: number;

  @ApiProperty({ description: 'Calculated fats for the specific weight' })
  fats: number;

  @ApiProperty({ description: 'Calculated carbs for the specific weight' })
  carbs: number;
}
