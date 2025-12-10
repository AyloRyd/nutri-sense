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
import { TemplateFoodsService } from './template-foods.service';
import { CreateTemplateFoodDto } from './dto/create-template-food.dto';
import { UpdateTemplateFoodDto } from './dto/update-template-food.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { JwtRequest } from 'src/auth/types/jwt-request.interface';
import { TemplateFoodEntity } from './entities/template-food.entity';

@Controller('templates/foods')
@ApiTags('template-foods')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TemplateFoodsController {
  constructor(private readonly templateFoodsService: TemplateFoodsService) {}

  @Get()
  @ApiOkResponse({ type: TemplateFoodEntity, isArray: true })
  findAll(@Req() req: JwtRequest) {
    return this.templateFoodsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOkResponse({ type: TemplateFoodEntity })
  findOne(@Req() req: JwtRequest, @Param('id', ParseIntPipe) id: number) {
    return this.templateFoodsService.findOne(req.user.id, id);
  }

  @Post()
  @ApiOkResponse({ type: TemplateFoodEntity })
  create(@Req() req: JwtRequest, @Body() dto: CreateTemplateFoodDto) {
    return this.templateFoodsService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: TemplateFoodEntity })
  update(
    @Req() req: JwtRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTemplateFoodDto,
  ) {
    return this.templateFoodsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Req() req: JwtRequest, @Param('id', ParseIntPipe) id: number) {
    this.templateFoodsService.remove(req.user.id, id);
  }
}
