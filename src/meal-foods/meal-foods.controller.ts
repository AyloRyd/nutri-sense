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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MealFoodsService } from './meal-foods.service';
import { CreateMealFoodDto } from './dto/create-meal-food.dto';
import { UpdateMealFoodDto } from './dto/update-meal-food.dto';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { JwtRequest } from 'src/auth/types/jwt-request.interface';
import { MealFoodEntity } from './entities/meal-food.entity';

@Controller('meals/:mealId/foods')
@ApiTags('meal-foods')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MealFoodsController {
  constructor(private readonly mealFoodsService: MealFoodsService) {}

  @Get()
  @ApiOkResponse({ type: MealFoodEntity, isArray: true })
  findAll(
    @Req() req: JwtRequest,
    @Param('mealId', ParseIntPipe) mealId: number,
  ) {
    return this.mealFoodsService.findAll(req.user.userId, mealId);
  }

  @Get(':id')
  @ApiOkResponse({ type: MealFoodEntity })
  findOne(
    @Req() req: JwtRequest,
    @Param('mealId', ParseIntPipe) mealId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.mealFoodsService.findOne(req.user.userId, mealId, id);
  }

  @Post()
  @ApiOkResponse({ type: MealFoodEntity })
  create(
    @Req() req: JwtRequest,
    @Param('mealId', ParseIntPipe) mealId: number,
    @Body() dto: CreateMealFoodDto,
  ) {
    return this.mealFoodsService.create(req.user.userId, mealId, dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: MealFoodEntity })
  update(
    @Req() req: JwtRequest,
    @Param('mealId', ParseIntPipe) mealId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMealFoodDto,
  ) {
    return this.mealFoodsService.update(req.user.userId, mealId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @Req() req: JwtRequest,
    @Param('mealId', ParseIntPipe) mealId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    this.mealFoodsService.remove(req.user.userId, mealId, id);
  }
}
