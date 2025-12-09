import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTemplateFoodDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Chicken Breast' })
  name: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ example: 165, description: 'Calories per 100g or unit' })
  calories: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ example: 31, description: 'Protein per 100g or unit' })
  protein: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ example: 3.6, description: 'Fats per 100g or unit' })
  fats: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ example: 0, description: 'Carbs per 100g or unit' })
  carbs: number;
}
