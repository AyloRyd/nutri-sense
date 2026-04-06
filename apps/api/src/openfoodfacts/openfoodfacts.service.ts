import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ProductResponseDto } from './dto/product-response.dto';

export interface OpenFoodFactsResponse {
  status: number;
  product: {
    product_name?: string;
    product_name_en?: string;
    nutriments: {
      'energy-kcal_100g'?: number;
      'energy-kcal'?: number;
      proteins_100g?: number;
      proteins?: number;
      fat_100g?: number;
      fat?: number;
      carbohydrates_100g?: number;
      carbohydrates?: number;
    };
  };
}

@Injectable()
export class OpenfoodfactsService {
  constructor(private readonly httpService: HttpService) {}

  async getProduct(barcode: string): Promise<ProductResponseDto> {
    try {
      const data = await this.fetchFromApi(barcode);
      return this.transformData(data);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;

      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Failed to fetch product data: ${message}`);
    }
  }

  async fetchFromApi(barcode: string): Promise<OpenFoodFactsResponse> {
    const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
    const { data } = await firstValueFrom(
      this.httpService.get<OpenFoodFactsResponse>(url),
    );

    if (!data || data.status !== 1) {
      throw new NotFoundException(`Product with barcode ${barcode} not found`);
    }

    return data;
  }

  transformData(data: OpenFoodFactsResponse): ProductResponseDto {
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
  }
}
