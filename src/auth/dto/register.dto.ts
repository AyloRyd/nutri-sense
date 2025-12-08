import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { Sex } from 'src/generated/prisma/enums';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty()
  password: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false })
  avatar_url?: string;

  @IsOptional()
  @IsEnum(Sex)
  @ApiProperty({ required: false, enum: Sex })
  sex?: Sex;
}
