package com.nutrisense.mobile.data

import android.util.Log
import com.nutrisense.mobile.api.StatsApi
import com.nutrisense.mobile.api.UsersApi
import com.nutrisense.mobile.model.DailyStatsEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import org.json.JSONObject
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.inject.Inject
import javax.inject.Singleton

private const val TAG = "DashboardRepo"

data class DashboardData(
    val username: String,
    val todayDate: String,
    val stats: DailyStatsEntity?,
    val iotStatus: IotStatus?
)

@Singleton
class DashboardRepository @Inject constructor(
    private val statsApi: StatsApi,
    private val usersApi: UsersApi,
    private val iotRepository: IotRepository
) {
    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")

    fun loadDashboard(): Flow<Result<DashboardData>> = flow {
        try {
            val today = LocalDate.now().format(dateFormatter)
            Log.d(TAG, "loadDashboard: fetching data for $today")

            coroutineScope {
                val userDeferred  = async { usersApi.usersControllerGetMe() }
                val statsDeferred = async { statsApi.statsControllerGetStats(today, today) }
                val iotDeferred   = async { iotRepository.getStatus() }

                val userResponse = userDeferred.await()
                Log.d(TAG, "loadDashboard: user HTTP ${userResponse.code()}")
                if (!userResponse.isSuccessful) {
                    val msg = parseError(userResponse, "Failed to load user")
                    Log.e(TAG, "loadDashboard: user FAILED — $msg")
                    emit(Result.failure(Exception(msg)))
                    return@coroutineScope
                }

                val user = userResponse.body()!!
                Log.d(TAG, "loadDashboard: user=${user.username}")

                val statsResponse = statsDeferred.await()
                Log.d(TAG, "loadDashboard: stats HTTP ${statsResponse.code()}")
                val todayStats = if (statsResponse.isSuccessful) {
                    statsResponse.body()?.firstOrNull().also {
                        Log.d(TAG, "loadDashboard: stats calories=${it?.actualCalories}")
                    }
                } else {
                    Log.e(TAG, "loadDashboard: stats FAILED HTTP ${statsResponse.code()}")
                    null
                }

                val iotStatus = iotDeferred.await().getOrNull()
                Log.d(TAG, "loadDashboard: iot isLinked=${iotStatus?.isLinked} serial=${iotStatus?.serialNumber}")

                emit(Result.success(DashboardData(
                    username  = user.username,
                    todayDate = today,
                    stats     = todayStats,
                    iotStatus = iotStatus
                )))
                Log.d(TAG, "loadDashboard: SUCCESS")
            }
        } catch (e: Exception) {
            Log.e(TAG, "loadDashboard: EXCEPTION", e)
            emit(Result.failure(Exception(e.message ?: "Network error")))
        }
    }.flowOn(Dispatchers.IO)

    private fun <T> parseError(response: retrofit2.Response<T>, fallback: String): String {
        return try {
            val body = response.errorBody()?.string() ?: return fallback
            val json = JSONObject(body)
            json.optJSONObject("error")?.optString("message")?.takeIf { it.isNotBlank() }
                ?: json.optString("message").takeIf { it.isNotBlank() }
                ?: fallback
        } catch (e: Exception) { fallback }
    }
}
