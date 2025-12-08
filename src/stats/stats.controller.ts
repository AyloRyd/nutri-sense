import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { StatsService } from './stats.service';
import { GetStatsFilterDto } from './dto/get-stats-filter.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { JwtRequest } from 'src/auth/types/jwt-request.interface';
import { DailyStatsEntity } from './entities/daily-stat.entity';

@Controller('stats')
@ApiTags('stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOkResponse({ type: DailyStatsEntity, isArray: true })
  getStats(@Req() req: JwtRequest, @Query() filter: GetStatsFilterDto) {
    return this.statsService.getStats(req.user.userId, filter);
  }
}
