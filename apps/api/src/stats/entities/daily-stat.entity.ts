import { ApiProperty } from '@nestjs/swagger';
import { PlanEntity } from 'src/plans/entities/plan.entity';

export class DailyStatsEntity {
  @ApiProperty({ example: '2023-12-08' })
  date: string;

  @ApiProperty({
    description: 'The active plan for this specific date, or null if none',
    nullable: true,
    required: false,
    type: () => PlanEntity,
  })
  plan: PlanEntity | null;

  @ApiProperty({
    example: 1850,
    description: 'Sum of all meals for this date',
  })
  actual_calories: number;

  @ApiProperty({ example: 120 })
  actual_protein: number;

  @ApiProperty({ example: 65 })
  actual_fats: number;

  @ApiProperty({ example: 210 })
  actual_carbs: number;
}
