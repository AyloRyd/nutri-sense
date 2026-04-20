package com.nutrisense.mobile.data

import com.nutrisense.mobile.api.PlansApi
import com.nutrisense.mobile.model.PlanEntity
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PlansRepository @Inject constructor(
    private val plansApi: PlansApi
) {
    suspend fun getPlanByDate(date: String): Result<PlanEntity> {
        return try {
            val response = plansApi.plansControllerFindByDate(date)
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) Result.success(body)
                else Result.failure(Exception("Plan is null"))
            } else {
                Result.failure(Exception("Failed to fetch plan: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
