import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { GetMealsFilterDto } from './dto/get-meals-filter.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { JwtRequest } from 'src/auth/types/jwt-request.interface';
import { MealEntity } from './entities/meal.entity';

@Controller('meals')
@ApiTags('meals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get()
  @ApiOkResponse({ type: MealEntity, isArray: true })
  findAll(@Req() req: JwtRequest, @Query() filter: GetMealsFilterDto) {
    return this.mealsService.findAll(req.user.id, filter);
  }

  @Get(':id')
  @ApiOkResponse({ type: MealEntity })
  findOne(@Req() req: JwtRequest, @Param('id', ParseIntPipe) id: number) {
    return this.mealsService.findOne(req.user.id, id);
  }

  @Post()
  @ApiOkResponse({ type: MealEntity })
  @ApiBody({
    type: CreateMealDto,
    examples: {
      default: {
        summary: 'Lunch with Chicken Breast',
        value: {
          name: 'Lunch',
          date: '2023-12-08T12:00:00Z',
          mealFoods: [
            {
              name: 'Chicken Breast',
              weight: 150,
              calories: 165,
              protein: 31,
              fats: 3.6,
              carbs: 0,
            },
          ],
        },
      },
    },
  })
  create(@Req() req: JwtRequest, @Body() createMealDto: CreateMealDto) {
    return this.mealsService.create(req.user.id, createMealDto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: MealEntity })
  update(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMealDto: UpdateMealDto,
  ) {
    return this.mealsService.update(req.user.id, id, updateMealDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async remove(@Req() req: JwtRequest, @Param('id', ParseIntPipe) id: number) {
    return this.mealsService.remove(req.user.id, id);
  }
}
