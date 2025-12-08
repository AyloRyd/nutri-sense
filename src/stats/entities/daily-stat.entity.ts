import { ApiProperty } from '@nestjs/swagger';
import { PlanEntity } from 'src/plans/entities/plan.entity';

export class DailyStatsEntity {
  @ApiProperty()
  date: string;

  @ApiProperty({ description: 'The active plan for this specific date' })
  plan: PlanEntity;

  @ApiProperty({ description: 'Sum of all meals for this date' })
  actual_calories: number;

  @ApiProperty()
  actual_protein: number;

  @ApiProperty()
  actual_fats: number;

  @ApiProperty()
  actual_carbs: number;
}
