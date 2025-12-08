import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { PlanGoal } from 'src/generated/prisma/enums'; 

export class CreatePlanDto {
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2023-12-08T00:00:00Z',
    description: 'Start date of the plan',
  })
  start_date: string;

  @IsOptional()
  @IsEnum(PlanGoal)
  @ApiProperty({
    enum: PlanGoal,
    required: false,
    description: 'Required for auto-calculation',
  })
  goal?: PlanGoal;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    required: false,
    description: 'Manual override for daily calories',
  })
  day_calories?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    required: false,
    description: 'Manual override for daily protein (g)',
  })
  day_protein?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    required: false,
    description: 'Manual override for daily fats (g)',
  })
  day_fats?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    required: false,
    description: 'Manual override for daily carbs (g)',
  })
  day_carbs?: number;
}
