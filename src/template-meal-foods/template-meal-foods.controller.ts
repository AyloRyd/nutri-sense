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
import { TemplateMealFoodsService } from './template-meal-foods.service';
import { CreateTemplateMealFoodDto } from './dto/create-template-meal-food.dto';
import { UpdateTemplateMealFoodDto } from './dto/update-template-meal-food.dto';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { JwtRequest } from 'src/auth/types/jwt-request.interface';
import { TemplateMealFoodEntity } from './entities/template-meal-food.entity';

@Controller('templates/meals/:templateMealId/foods')
@ApiTags('template-meal-foods')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TemplateMealFoodsController {
  constructor(
    private readonly templateMealFoodsService: TemplateMealFoodsService,
  ) {}

  @Get()
  @ApiOkResponse({ type: TemplateMealFoodEntity, isArray: true })
  findAll(
    @Req() req: JwtRequest,
    @Param('templateMealId', ParseIntPipe) templateMealId: number,
  ) {
    return this.templateMealFoodsService.findAll(
      req.user.id,
      templateMealId,
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: TemplateMealFoodEntity })
  findOne(
    @Req() req: JwtRequest,
    @Param('templateMealId', ParseIntPipe) templateMealId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.templateMealFoodsService.findOne(
      req.user.id,
      templateMealId,
      id,
    );
  }

  @Post()
  @ApiOkResponse({ type: TemplateMealFoodEntity })
  create(
    @Req() req: JwtRequest,
    @Param('templateMealId', ParseIntPipe) templateMealId: number,
    @Body() dto: CreateTemplateMealFoodDto,
  ) {
    return this.templateMealFoodsService.create(
      req.user.id,
      templateMealId,
      dto,
    );
  }

  @Patch(':id')
  @ApiOkResponse({ type: TemplateMealFoodEntity })
  update(
    @Req() req: JwtRequest,
    @Param('templateMealId', ParseIntPipe) templateMealId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTemplateMealFoodDto,
  ) {
    return this.templateMealFoodsService.update(
      req.user.id,
      templateMealId,
      id,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @Req() req: JwtRequest,
    @Param('templateMealId', ParseIntPipe) templateMealId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    this.templateMealFoodsService.remove(req.user.id, templateMealId, id);
  }
}
