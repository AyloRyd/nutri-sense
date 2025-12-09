import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { OpenfoodfactsService } from './openfoodfacts.service';
import { ProductResponseDto } from './dto/product-response.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('openfoodfacts')
@ApiTags('openfoodfacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OpenfoodfactsController {
  constructor(private readonly openFoodFactsService: OpenfoodfactsService) {}

  @Get('product/:barcode')
  @ApiOkResponse({ type: ProductResponseDto })
  getProduct(@Param('barcode') barcode: string) {
    return this.openFoodFactsService.getProduct(barcode);
  }
}
