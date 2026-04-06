import { Test, TestingModule } from '@nestjs/testing';
import {
  OpenfoodfactsService,
  OpenFoodFactsResponse,
} from './openfoodfacts.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import axios from 'axios';

describe('OpenfoodfactsService', () => {
  let service: OpenfoodfactsService;
  let httpService: HttpService;

  const mockProductData = {
    status: 1,
    product: {
      product_name: 'Nutella',
      nutriments: {
        'energy-kcal_100g': 539,
        proteins_100g: 6.3,
        fat_100g: 30.9,
        carbohydrates_100g: 57.5,
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenfoodfactsService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn().mockReturnValue(of({ data: mockProductData })),
          },
        },
      ],
    }).compile();

    service = module.get<OpenfoodfactsService>(OpenfoodfactsService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transformData (Mocked Way)', () => {
    it('should correctly transform API response to ProductResponseDto', () => {
      const result = service.transformData(
        mockProductData as unknown as OpenFoodFactsResponse,
      );
      expect(result).toEqual({
        name: 'Nutella',
        calories: 539,
        protein: 6.3,
        fats: 30.9,
        carbs: 57.5,
      });
    });

    it('should handle missing nutriment values with defaults', () => {
      const incompleteData = {
        product: {
          product_name: 'Empty Product',
          nutriments: {},
        },
      };
      const result = service.transformData(
        incompleteData as unknown as OpenFoodFactsResponse,
      );
      expect(result).toEqual({
        name: 'Empty Product',
        calories: 0,
        protein: 0,
        fats: 0,
        carbs: 0,
      });
    });
  });

  describe('getProduct (Mocked Way)', () => {
    it('should fetch and transform product data', async () => {
      const barcode = '3017620422003';
      const result = await service.getProduct(barcode);
      expect(result.name).toBe('Nutella');
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(
        of({
          data: { status: 0 },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { headers: {} } as InternalAxiosRequestConfig,
        } as AxiosResponse),
      );
      await expect(service.getProduct('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // Second way: Actual fetching (Live Test)
  // Note: This test requires internet access and depends on external API availability.
  // We skip this in CI to avoid flakiness and rate limiting (429).
  (process.env.CI ? describe.skip : describe)(
    'getProduct (Actual Fetching - Live)',
    () => {
      let liveService: OpenfoodfactsService;

      beforeEach(async () => {
        const axiosInstance: AxiosInstance = axios.create();
        const module: TestingModule = await Test.createTestingModule({
          // Use real HttpService with its dependencies (simplified for test)
          providers: [
            OpenfoodfactsService,
            {
              provide: HttpService,
              useValue: new HttpService(axiosInstance),
            },
          ],
        }).compile();
        liveService = module.get<OpenfoodfactsService>(OpenfoodfactsService);
      });

      it('should fetch actual data for Nutella barcode 3017620422003', async () => {
        const barcode = '3017620422003';
        const result = await liveService.getProduct(barcode);

        expect(result.name.toLowerCase()).toContain('nutella');
        expect(result.calories).toBeGreaterThan(0);
        expect(result.protein).toBeGreaterThan(0);
        expect(result.fats).toBeGreaterThan(0);
        expect(result.carbs).toBeGreaterThan(0);

        // Specifically check the values provided by the user if they match exactly
        expect(result).toEqual({
          name: expect.any(String) as unknown, // Name might vary slightly (e.g. "Nutella" vs "Nutella 400g")
          calories: 539,
          protein: 6.3,
          fats: 30.9,
          carbs: 57.5,
        });
      }, 15000); // Increase timeout for live fetch
    },
  );
});
