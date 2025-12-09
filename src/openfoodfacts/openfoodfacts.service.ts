import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ProductResponseDto } from './dto/product-response.dto';

@Injectable()
export class OpenfoodfactsService {
  constructor(private readonly httpService: HttpService) {}

  async getProduct(barcode: string): Promise<ProductResponseDto> {
    const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;

    try {
      const { data } = await firstValueFrom(this.httpService.get(url));

      if (!data || data.status !== 1) {
        throw new NotFoundException(
          `Product with barcode ${barcode} not found`,
        );
      }

      const product = data.product;
      const nutriments = product.nutriments;

      return {
        name:
          product.product_name || product.product_name_en || 'Unknown Product',
        calories:
          nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0,
        protein: nutriments.proteins_100g || nutriments.proteins || 0,
        fats: nutriments.fat_100g || nutriments.fat || 0,
        carbs: nutriments.carbohydrates_100g || nutriments.carbohydrates || 0,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      throw new BadRequestException(
        `Failed to fetch product data: ${error.message}`,
      );
    }
  }
}
