import { Module } from '@nestjs/common';
import { TemplateMealFoodsService } from './template-meal-foods.service';
import { TemplateMealFoodsController } from './template-meal-foods.controller';

@Module({
  controllers: [TemplateMealFoodsController],
  providers: [TemplateMealFoodsService],
})
export class TemplateMealFoodsModule {}
