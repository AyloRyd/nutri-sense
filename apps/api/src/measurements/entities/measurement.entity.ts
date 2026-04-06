import { ApiProperty } from '@nestjs/swagger';
import { UserMeasurement } from 'src/generated/prisma/client';

export class MeasurementEntity implements UserMeasurement {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  user_id: number;

  @ApiProperty({ example: '2023-12-08T10:00:00.000Z' })
  date: Date;

  @ApiProperty({ example: 75.5, description: 'Weight in kg' })
  weight: number;

  @ApiProperty({ example: 180, description: 'Height in cm' })
  height: number;

  @ApiProperty({ example: 1.2, description: 'Activity level' })
  activity: number;
}
