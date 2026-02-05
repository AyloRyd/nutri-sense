import { ApiProperty } from '@nestjs/swagger';
import { TemplateFood } from 'src/generated/prisma/client';

export class TemplateFoodEntity implements TemplateFood {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  user_id: number;

  @ApiProperty({ example: 'Chicken Breast' })
  name: string;

  @ApiProperty({ example: 165, description: 'Per 100g or unit' })
  calories: number;

  @ApiProperty({ example: 31, description: 'Per 100g or unit' })
  protein: number;

  @ApiProperty({ example: 3.6, description: 'Per 100g or unit' })
  fats: number;

  @ApiProperty({ example: 0, description: 'Per 100g or unit' })
  carbs: number;
}
