import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { JwtRequest } from 'src/auth/types/jwt-request.interface';
import { MeasurementEntity } from './entities/measurement.entity';

@Controller('measurements')
@ApiTags('measurements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Get()
  @ApiOkResponse({ type: MeasurementEntity, isArray: true })
  findAll(@Req() req: JwtRequest) {
    return this.measurementsService.findAll(req.user.userId);
  }

  @Get('current')
  @ApiOkResponse({ type: MeasurementEntity })
  findCurrent(@Req() req: JwtRequest) {
    return this.measurementsService.findCurrent(req.user.userId);
  }

  @Post()
  @ApiOkResponse({ type: MeasurementEntity })
  create(@Req() req: JwtRequest, @Body() dto: CreateMeasurementDto) {
    return this.measurementsService.create(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: MeasurementEntity })
  update(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMeasurementDto,
  ) {
    return this.measurementsService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: MeasurementEntity })
  remove(@Req() req: JwtRequest, @Param('id', ParseIntPipe) id: number) {
    return this.measurementsService.remove(req.user.userId, id);
  }
}