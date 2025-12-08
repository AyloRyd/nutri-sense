import { ApiProperty } from '@nestjs/swagger';
import { Plan } from 'src/generated/prisma/client';
import { PlanGoal } from 'src/generated/prisma/enums';

export class PlanEntity implements Plan {
  @ApiProperty()
  id: number;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  start_date: Date;

  @ApiProperty({ enum: PlanGoal })
  plan: PlanGoal;

  @ApiProperty()
  day_calories: number;

  @ApiProperty()
  day_protein: number;

  @ApiProperty()
  day_fats: number;

  @ApiProperty()
  day_carbs: number;
}