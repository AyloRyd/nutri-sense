import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateMealFoodDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Chicken Breast' })
  name: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty({ example: 150, description: 'Weight in grams' })
  weight: number;

  @IsNumber()
  @ApiProperty({ example: 165, description: 'Calories per 100g' })
  calories: number;

  @IsNumber()
  @ApiProperty({ example: 31, description: 'Protein per 100g' })
  protein: number;

  @IsNumber()
  @ApiProperty({ example: 3.6, description: 'Fats per 100g' })
  fats: number;

  @IsNumber()
  @ApiProperty({ example: 0, description: 'Carbs per 100g' })
  carbs: number;
}
