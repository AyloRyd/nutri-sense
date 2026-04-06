import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { JwtRequest } from 'src/auth/types/jwt-request.interface';
import { PlanEntity } from './entities/plan.entity';

@Controller('plans')
@ApiTags('plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOkResponse({ type: PlanEntity, isArray: true })
  findAll(@Req() req: JwtRequest) {
    return this.plansService.findAll(req.user.id);
  }

  @Get('current')
  @ApiOkResponse({ type: PlanEntity })
  findCurrent(@Req() req: JwtRequest) {
    return this.plansService.findActiveByDate(
      req.user.id,
      new Date().toISOString(),
    );
  }

  @Get('date/:date')
  @ApiOkResponse({ type: PlanEntity })
  findByDate(@Req() req: JwtRequest, @Param('date') date: string) {
    return this.plansService.findActiveByDate(req.user.id, date);
  }

  @Post()
  @ApiOkResponse({ type: PlanEntity })
  create(@Req() req: JwtRequest, @Body() dto: CreatePlanDto) {
    return this.plansService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: PlanEntity })
  update(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.plansService.update(req.user.id, id, dto);
  }
}
