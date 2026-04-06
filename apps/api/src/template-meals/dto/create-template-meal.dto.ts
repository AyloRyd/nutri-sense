import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CreateTemplateMealFoodDto } from 'src/template-meal-foods/dto/create-template-meal-food.dto';

export class CreateTemplateMealDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'My Breakfast Template' })
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateMealFoodDto)
  @ApiProperty({ type: [CreateTemplateMealFoodDto] })
  templateMealFoods: CreateTemplateMealFoodDto[];
}
