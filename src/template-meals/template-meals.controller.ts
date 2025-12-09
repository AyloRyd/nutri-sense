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
import { TemplateMealsService } from './template-meals.service';
import { CreateTemplateMealDto } from './dto/create-template-meal.dto';
import { UpdateTemplateMealDto } from './dto/update-template-meal.dto';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { JwtRequest } from 'src/auth/types/jwt-request.interface';
import { TemplateMealEntity } from './entities/template-meal.entity';

@Controller('templates/meals')
@ApiTags('template-meals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TemplateMealsController {
  constructor(private readonly templateMealsService: TemplateMealsService) {}

  @Get()
  @ApiOkResponse({ type: TemplateMealEntity, isArray: true })
  findAll(@Req() req: JwtRequest) {
    return this.templateMealsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOkResponse({ type: TemplateMealEntity })
  findOne(@Req() req: JwtRequest, @Param('id', ParseIntPipe) id: number) {
    return this.templateMealsService.findOne(req.user.userId, id);
  }

  @Post()
  @ApiOkResponse({ type: TemplateMealEntity })
  create(
    @Req() req: JwtRequest,
    @Body() createTemplateMealDto: CreateTemplateMealDto,
  ) {
    return this.templateMealsService.create(
      req.user.userId,
      createTemplateMealDto,
    );
  }

  @Patch(':id')
  @ApiOkResponse({ type: TemplateMealEntity })
  update(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTemplateMealDto: UpdateTemplateMealDto,
  ) {
    return this.templateMealsService.update(
      req.user.userId,
      id,
      updateTemplateMealDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Req() req: JwtRequest, @Param('id', ParseIntPipe) id: number) {
    this.templateMealsService.remove(req.user.userId, id);
  }
}
