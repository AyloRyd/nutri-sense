import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LinkDeviceDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'SN-ESP32-998877',
    description: 'The unique serial number of the IoT scale',
  })
  serial_number: string;
}
