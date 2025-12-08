import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CreateMeasurementDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({ example: 75.5, description: 'Weight in kg' })
  weight: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({ example: 180, description: 'Height in cm' })
  height: number;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, example: '2023-12-08T10:00:00Z' })
  date?: string;
}
