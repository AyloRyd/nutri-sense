package com.nutrisense.mobile.data

import com.nutrisense.mobile.api.OpenfoodfactsApi
import com.nutrisense.mobile.model.ProductResponseDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OpenfoodfactsRepository @Inject constructor(
    private val api: OpenfoodfactsApi
) {
    suspend fun getProduct(barcode: String): Result<ProductResponseDto> {
        return try {
            val response = api.openfoodfactsControllerGetProduct(barcode)
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) Result.success(body)
                else Result.failure(Exception("Product is null"))
            } else {
                Result.failure(Exception("Failed to fetch product for barcode $barcode: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
