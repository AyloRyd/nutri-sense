import { ApiProperty } from '@nestjs/swagger';
import { Sex, User } from 'src/generated/prisma/client';

export class UserEntity implements User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  hashed_password: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ required: false })
  avatar_url: string;

  @ApiProperty({ required: false })
  sex: Sex;
}