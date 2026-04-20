package com.nutrisense.mobile.data

import com.nutrisense.mobile.api.StatsApi
import com.nutrisense.mobile.model.DailyStatsEntity
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StatsRepository @Inject constructor(
    private val statsApi: StatsApi
) {
    suspend fun getStats(start: String, end: String): Result<List<DailyStatsEntity>> {
        return try {
            val response = statsApi.statsControllerGetStats(start, end)
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to fetch stats: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
