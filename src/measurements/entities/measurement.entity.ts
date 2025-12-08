import { ApiProperty } from '@nestjs/swagger';
import { UserMeasurement } from 'src/generated/prisma/client';

export class MeasurementEntity implements UserMeasurement {
  @ApiProperty()
  id: number;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  weight: number;

  @ApiProperty()
  height: number;
}