import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetStatsFilterDto {
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ example: '2023-12-01' })
  start: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ example: '2023-12-07' })
  end: string;
}
