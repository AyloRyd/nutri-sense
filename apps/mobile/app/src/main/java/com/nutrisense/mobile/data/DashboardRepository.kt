package com.nutrisense.mobile.data

import com.nutrisense.mobile.api.StatsApi
import com.nutrisense.mobile.api.UsersApi
import com.nutrisense.mobile.model.DailyStatsEntity
import com.nutrisense.mobile.model.UserEntity
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

            coroutineScope {
                val userDeferred  = async { usersApi.usersControllerGetMe() }
                val statsDeferred = async { statsApi.statsControllerGetStats(today, today) }
                val iotDeferred   = async { iotRepository.getStatus() }

                val userResponse = userDeferred.await()
                if (!userResponse.isSuccessful) {
                    emit(Result.failure(Exception(parseError(userResponse, "Failed to load user"))))
                    return@coroutineScope
                }

                val user = userResponse.body()!!
                val todayStats = statsDeferred.await().let { resp ->
                    if (resp.isSuccessful) resp.body()?.firstOrNull() else null
                }
                val iotStatus = iotDeferred.await().getOrNull()

                emit(Result.success(DashboardData(
                    username  = user.username,
                    todayDate = today,
                    stats     = todayStats,
                    iotStatus = iotStatus
                )))
            }
        } catch (e: Exception) {
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

