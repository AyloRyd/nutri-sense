import { ApiProperty } from '@nestjs/swagger';
import { Plan } from 'src/generated/prisma/client';
import { PlanGoal } from 'src/generated/prisma/enums';

export class PlanEntity implements Plan {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  user_id: number;

  @ApiProperty({ example: '2023-12-08T00:00:00.000Z' })
  start_date: Date;

  @ApiProperty({ enum: PlanGoal, example: 'maintain' })
  plan: PlanGoal;

  @ApiProperty({ example: 2200 })
  day_calories: number;

  @ApiProperty({ example: 150 })
  day_protein: number;

  @ApiProperty({ example: 73 })
  day_fats: number;

  @ApiProperty({ example: 275 })
  day_carbs: number;
}
