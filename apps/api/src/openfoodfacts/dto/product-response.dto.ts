import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 'Nutella' })
  name: string;

  @ApiProperty({ example: 539, description: 'Kcal per 100g' })
  calories: number;

  @ApiProperty({ example: 6.3, description: 'Protein per 100g' })
  protein: number;

  @ApiProperty({ example: 30.9, description: 'Fats per 100g' })
  fats: number;

  @ApiProperty({ example: 57.5, description: 'Carbs per 100g' })
  carbs: number;
}
