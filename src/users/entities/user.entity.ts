import { ApiProperty } from '@nestjs/swagger';
import { Sex, User } from 'src/generated/prisma/client';

export class UserEntity implements Omit<User, 'hashed_password'> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ required: false })
  avatar_url: string;

  @ApiProperty({ required: false })
  sex: Sex;

  @ApiProperty({ required: false })
  date_of_birth: Date;
}