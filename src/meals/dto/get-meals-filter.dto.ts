import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetMealsFilterDto {
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2023-12-08',
    description: 'Start date (YYYY-MM-DD)',
  })
  start: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ 
    example: '2023-12-08', 
    description: 'End date (YYYY-MM-DD)' 
  })
  end: string;
}
