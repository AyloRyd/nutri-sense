import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { Sex } from 'src/generated/prisma/enums';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @IsOptional()
  @IsEnum(Sex)
  @ApiProperty({ required: false, enum: Sex, example: 'male' })
  sex?: Sex;

  @IsOptional()
  @ApiProperty({
    required: false,
    example: '1990-01-15T00:00:00.000Z',
    description: 'ISO 8601 date string',
  })
  date_of_birth?: Date;
}
