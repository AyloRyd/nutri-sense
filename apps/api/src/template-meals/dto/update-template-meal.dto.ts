import { PartialType } from '@nestjs/swagger';
import { CreateTemplateMealDto } from './create-template-meal.dto';

export class UpdateTemplateMealDto extends PartialType(CreateTemplateMealDto) {}
