import { PartialType } from '@nestjs/swagger';
import { CreateTemplateFoodDto } from './create-template-food.dto';

export class UpdateTemplateFoodDto extends PartialType(CreateTemplateFoodDto) {}
