import { Module } from '@nestjs/common';
import { TemplateMealsService } from './template-meals.service';
import { TemplateMealsController } from './template-meals.controller';

@Module({
  controllers: [TemplateMealsController],
  providers: [TemplateMealsService],
  exports: [TemplateMealsService],
})
export class TemplateMealsModule {}
