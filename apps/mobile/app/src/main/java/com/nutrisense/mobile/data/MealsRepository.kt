package com.nutrisense.mobile.data

import com.nutrisense.mobile.api.MealsApi
import com.nutrisense.mobile.api.MealFoodsApi
import com.nutrisense.mobile.model.CreateMealDto
import com.nutrisense.mobile.model.CreateMealFoodDto
import com.nutrisense.mobile.model.MealEntity
import com.nutrisense.mobile.model.MealFoodEntity
import com.nutrisense.mobile.model.UpdateMealDto
import com.nutrisense.mobile.model.UpdateMealFoodDto
import java.math.BigDecimal
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MealsRepository @Inject constructor(
    private val mealsApi: MealsApi,
    private val mealFoodsApi: MealFoodsApi
) {
    suspend fun getMeals(start: String, end: String): Result<List<MealEntity>> {
        return try {
            val response = mealsApi.mealsControllerFindAll(start, end)
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to fetch meals: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMeal(id: Int): Result<MealEntity> {
        return try {
            val response = mealsApi.mealsControllerFindOne(BigDecimal(id))
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) Result.success(body)
                else Result.failure(Exception("Meal data is null"))
            } else {
                Result.failure(Exception("Failed to fetch meal: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createMeal(createMealDto: CreateMealDto): Result<MealEntity> {
        return try {
            val response = mealsApi.mealsControllerCreate(createMealDto)
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) Result.success(body)
                else Result.failure(Exception("Created meal is null"))
            } else {
                Result.failure(Exception("Failed to create meal: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteMeal(id: Int): Result<Unit> {
        return try {
            val response = mealsApi.mealsControllerRemove(BigDecimal(id))
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to delete meal: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateMeal(id: Int, updateMealDto: UpdateMealDto): Result<MealEntity> {
        return try {
            val response = mealsApi.mealsControllerUpdate(BigDecimal(id), updateMealDto)
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) Result.success(body)
                else Result.failure(Exception("Updated meal is null"))
            } else {
                Result.failure(Exception("Failed to update meal: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun addFood(mealId: Int, createMealFoodDto: CreateMealFoodDto): Result<MealFoodEntity> {
        return try {
            val response = mealFoodsApi.mealFoodsControllerCreate(BigDecimal(mealId), createMealFoodDto)
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) Result.success(body)
                else Result.failure(Exception("Created food is null"))
            } else {
                Result.failure(Exception("Failed to add food: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateFood(mealId: Int, id: Int, updateMealFoodDto: UpdateMealFoodDto): Result<MealFoodEntity> {
        return try {
            val response = mealFoodsApi.mealFoodsControllerUpdate(BigDecimal(mealId), BigDecimal(id), updateMealFoodDto)
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) Result.success(body)
                else Result.failure(Exception("Updated food is null"))
            } else {
                Result.failure(Exception("Failed to update food: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun removeFood(mealId: Int, id: Int): Result<Unit> {
        return try {
            val response = mealFoodsApi.mealFoodsControllerRemove(BigDecimal(mealId), BigDecimal(id))
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to delete food: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
