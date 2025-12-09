import { Module } from '@nestjs/common';
import { OpenfoodfactsService } from './openfoodfacts.service';
import { OpenfoodfactsController } from './openfoodfacts.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [OpenfoodfactsController],
  providers: [OpenfoodfactsService],
})
export class OpenfoodfactsModule {}
