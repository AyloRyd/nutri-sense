import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IotService } from './iot.service';
import { LinkDeviceDto } from './dto/link-device.dto';
import type { JwtRequest } from 'src/auth/types/jwt-request.interface';

@Controller('iot/scales')
@ApiTags('iot/scales')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IotController {
  constructor(private readonly iotService: IotService) {}

  @Post('link')
  @ApiOkResponse({ description: 'Device linked successfully' })
  linkDevice(@Req() req: JwtRequest, @Body() dto: LinkDeviceDto) {
    return this.iotService.linkDevice(req.user.id, dto);
  }

  @Delete('link')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Device unlinked successfully' })
  unlinkDevice(@Req() req: JwtRequest) {
    return this.iotService.unlinkDevice(req.user.id);
  }

  @Get('status')
  @ApiOkResponse({ description: 'Returns linking status and serial number' })
  getStatus(@Req() req: JwtRequest) {
    return this.iotService.getDeviceStatus(req.user.id);
  }

  @Get('weight')
  @ApiOkResponse({ description: 'Returns the weight measured by the scale' })
  getCurrentWeight(@Req() req: JwtRequest) {
    return this.iotService.getCurrentWeight(req.user.id);
  }
}
