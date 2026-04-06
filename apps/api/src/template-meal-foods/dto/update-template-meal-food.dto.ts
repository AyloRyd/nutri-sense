import { PartialType } from '@nestjs/swagger';
import { CreateTemplateMealFoodDto } from './create-template-meal-food.dto';

export class UpdateTemplateMealFoodDto extends PartialType(
  CreateTemplateMealFoodDto,
) {}
