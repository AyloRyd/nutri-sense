import { Module } from '@nestjs/common';
import { TemplateFoodsService } from './template-foods.service';
import { TemplateFoodsController } from './template-foods.controller';

@Module({
  controllers: [TemplateFoodsController],
  providers: [TemplateFoodsService],
})
export class TemplateFoodsModule {}
