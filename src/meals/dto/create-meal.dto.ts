import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class MealFoodDto {
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

export class CreateMealDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Lunch' })
  name: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ example: '2023-12-08T12:00:00Z' })
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealFoodDto)
  @ApiProperty({ type: [MealFoodDto] })
  mealFoods: MealFoodDto[];
}
