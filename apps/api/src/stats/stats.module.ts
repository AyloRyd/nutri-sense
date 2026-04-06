import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { PlansModule } from 'src/plans/plans.module';
import { MealsModule } from 'src/meals/meals.module';

@Module({
  imports: [PlansModule, MealsModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
