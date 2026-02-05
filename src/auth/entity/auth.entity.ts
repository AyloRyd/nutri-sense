import { ApiProperty } from '@nestjs/swagger';

export class AuthEntity {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSJ9.example',
  })
  access_token: string;
}
