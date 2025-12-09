import { ApiProperty } from '@nestjs/swagger';
import { TemplateFood } from 'src/generated/prisma/client';

export class TemplateFoodEntity implements TemplateFood {
  @ApiProperty()
  id: number;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  calories: number;

  @ApiProperty()
  protein: number;

  @ApiProperty()
  fats: number;

  @ApiProperty()
  carbs: number;
}
