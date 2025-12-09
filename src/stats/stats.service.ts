import { Injectable, NotFoundException } from '@nestjs/common';
import { MealsService } from 'src/meals/meals.service';
import { PlansService } from 'src/plans/plans.service';
import { GetStatsFilterDto } from './dto/get-stats-filter.dto';
import { PlanEntity } from 'src/plans/entities/plan.entity';
import { DailyStatsEntity } from './entities/daily-stat.entity';

@Injectable()
export class StatsService {
  constructor(
    private readonly plansService: PlansService,
    private readonly mealsService: MealsService,
  ) {}

  async getStats(userId: number, filter: GetStatsFilterDto) {
    const start = new Date(filter.start);
    const end = new Date(filter.end);
    const stats: Array<DailyStatsEntity> = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];

      let activePlan: PlanEntity;
      try {
        activePlan = await this.plansService.findActiveByDate(
          userId,
          d.toISOString(),
        );
      } catch (_) {
        throw new NotFoundException(`No active plan found for date ${dateStr}`);
      }

      const meals = await this.mealsService.findAll(userId, {
        start: dateStr,
        end: dateStr,
      });

      const actuals = meals.reduce(
        (acc, meal) => ({
          calories: acc.calories + meal.calories,
          protein: acc.protein + meal.protein,
          fats: acc.fats + meal.fats,
          carbs: acc.carbs + meal.carbs,
        }),
        { calories: 0, protein: 0, fats: 0, carbs: 0 },
      );

      stats.push({
        date: dateStr,
        plan: activePlan,
        actual_calories: parseFloat(actuals.calories.toFixed(2)),
        actual_protein: parseFloat(actuals.protein.toFixed(2)),
        actual_fats: parseFloat(actuals.fats.toFixed(2)),
        actual_carbs: parseFloat(actuals.carbs.toFixed(2)),
      });
    }

    return stats;
  }
}
