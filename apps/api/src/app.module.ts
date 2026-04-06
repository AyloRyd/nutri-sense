import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { PlansModule } from './plans/plans.module';
import { MealsModule } from './meals/meals.module';
import { MealFoodsModule } from './meal-foods/meal-foods.module';
import { StatsModule } from './stats/stats.module';
import { TemplateFoodsModule } from './template-foods/template-foods.module';
import { OpenfoodfactsModule } from './openfoodfacts/openfoodfacts.module';
import { TemplateMealsModule } from './template-meals/template-meals.module';
import { TemplateMealFoodsModule } from './template-meal-foods/template-meal-foods.module';
import { IotModule } from './iot/iot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MeasurementsModule,
    PlansModule,
    MealsModule,
    MealFoodsModule,
    StatsModule,
    TemplateFoodsModule,
    TemplateMealsModule,
    TemplateMealFoodsModule,
    OpenfoodfactsModule,
    IotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
