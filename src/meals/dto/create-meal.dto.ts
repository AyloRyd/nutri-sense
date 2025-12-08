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
import { CreateMealFoodDto } from 'src/meal-foods/dto/create-meal-food.dto';

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
  @Type(() => CreateMealFoodDto)
  @ApiProperty({ type: [CreateMealFoodDto] })
  mealFoods: CreateMealFoodDto[];
}
