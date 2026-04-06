import { ApiProperty } from '@nestjs/swagger';
import { Sex, User } from 'src/generated/prisma/client';

export class UserEntity implements Omit<User, 'hashed_password'> {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({
    required: false,
    example: 'https://example.com/avatar.png',
  })
  avatar_url: string;

  @ApiProperty({ required: false, enum: Sex, example: 'male' })
  sex: Sex;

  @ApiProperty({
    required: false,
    example: '1990-01-15T00:00:00.000Z',
  })
  date_of_birth: Date;

  @ApiProperty({
    required: false,
    example: 'SN-ESP32-998877',
  })
  device_serial_id: string;
}
