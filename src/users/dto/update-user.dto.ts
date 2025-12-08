import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { Sex } from 'src/generated/prisma/enums';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @IsOptional()
  @IsEnum(Sex)
  @ApiProperty({ required: false, enum: Sex })
  sex?: Sex;

  @IsOptional()
  @ApiProperty({ required: false })
  date_of_birth?: Date;
}
