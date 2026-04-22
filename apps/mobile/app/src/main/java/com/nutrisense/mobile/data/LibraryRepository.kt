package com.nutrisense.mobile.data

import com.nutrisense.mobile.api.TemplateFoodsApi
import com.nutrisense.mobile.api.TemplateMealFoodsApi
import com.nutrisense.mobile.api.TemplateMealsApi
import com.nutrisense.mobile.model.CreateTemplateFoodDto
import com.nutrisense.mobile.model.CreateTemplateMealDto
import com.nutrisense.mobile.model.CreateTemplateMealFoodDto
import com.nutrisense.mobile.model.TemplateFoodEntity
import com.nutrisense.mobile.model.TemplateMealEntity
import com.nutrisense.mobile.model.TemplateMealFoodEntity
import com.nutrisense.mobile.model.UpdateTemplateFoodDto
import com.nutrisense.mobile.model.UpdateTemplateMealDto
import com.nutrisense.mobile.model.UpdateTemplateMealFoodDto
import java.math.BigDecimal
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LibraryRepository @Inject constructor(
    private val templateMealsApi: TemplateMealsApi,
    private val templateMealFoodsApi: TemplateMealFoodsApi,
    private val templateFoodsApi: TemplateFoodsApi
) {
    suspend fun getTemplateMeals(): Result<List<TemplateMealEntity>> = tryRequestList {
        templateMealsApi.templateMealsControllerFindAll()
    }

    suspend fun getTemplateMeal(id: Int): Result<TemplateMealEntity> = tryRequestBody("Template meal") {
        templateMealsApi.templateMealsControllerFindOne(BigDecimal(id))
    }

    suspend fun createTemplateMeal(dto: CreateTemplateMealDto): Result<TemplateMealEntity> = tryRequestBody("Template meal") {
        templateMealsApi.templateMealsControllerCreate(dto)
    }

    suspend fun updateTemplateMeal(id: Int, dto: UpdateTemplateMealDto): Result<TemplateMealEntity> = tryRequestBody("Template meal") {
        templateMealsApi.templateMealsControllerUpdate(BigDecimal(id), dto)
    }

    suspend fun deleteTemplateMeal(id: Int): Result<Unit> = tryRequestUnit {
        templateMealsApi.templateMealsControllerRemove(BigDecimal(id))
    }

    suspend fun addTemplateMealFood(templateMealId: Int, dto: CreateTemplateMealFoodDto): Result<TemplateMealFoodEntity> = tryRequestBody("Template meal food") {
        templateMealFoodsApi.templateMealFoodsControllerCreate(BigDecimal(templateMealId), dto)
    }

    suspend fun updateTemplateMealFood(
        templateMealId: Int,
        id: Int,
        dto: UpdateTemplateMealFoodDto
    ): Result<TemplateMealFoodEntity> = tryRequestBody("Template meal food") {
        templateMealFoodsApi.templateMealFoodsControllerUpdate(BigDecimal(templateMealId), BigDecimal(id), dto)
    }

    suspend fun removeTemplateMealFood(templateMealId: Int, id: Int): Result<Unit> = tryRequestUnit {
        templateMealFoodsApi.templateMealFoodsControllerRemove(BigDecimal(templateMealId), BigDecimal(id))
    }

    suspend fun getTemplateFoods(): Result<List<TemplateFoodEntity>> = tryRequestList {
        templateFoodsApi.templateFoodsControllerFindAll()
    }

    suspend fun createTemplateFood(dto: CreateTemplateFoodDto): Result<TemplateFoodEntity> = tryRequestBody("Template food") {
        templateFoodsApi.templateFoodsControllerCreate(dto)
    }

    suspend fun updateTemplateFood(id: Int, dto: UpdateTemplateFoodDto): Result<TemplateFoodEntity> = tryRequestBody("Template food") {
        templateFoodsApi.templateFoodsControllerUpdate(BigDecimal(id), dto)
    }

    suspend fun deleteTemplateFood(id: Int): Result<Unit> = tryRequestUnit {
        templateFoodsApi.templateFoodsControllerRemove(BigDecimal(id))
    }

    private inline fun <T> tryRequestBody(name: String, block: () -> retrofit2.Response<T>): Result<T> {
        return try {
            val response = block()
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) }
                    ?: Result.failure(Exception("$name response body is null"))
            } else {
                Result.failure(Exception("Failed request: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private inline fun <T> tryRequestList(block: () -> retrofit2.Response<List<T>>): Result<List<T>> {
        return try {
            val response = block()
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed request: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private inline fun tryRequestUnit(block: () -> retrofit2.Response<Unit>): Result<Unit> {
        return try {
            val response = block()
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed request: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
