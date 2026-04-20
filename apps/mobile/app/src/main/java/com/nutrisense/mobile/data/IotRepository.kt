package com.nutrisense.mobile.data

import android.util.Log
import com.nutrisense.mobile.BuildConfig
import com.nutrisense.mobile.api.IotScalesApi
import com.nutrisense.mobile.model.LinkDeviceDto
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

private const val TAG = "IotRepository"

data class IotStatus(
    val isLinked: Boolean,
    val serialNumber: String?
)

@Singleton
class IotRepository @Inject constructor(
    private val iotScalesApi: IotScalesApi,
    private val okHttpClient: OkHttpClient // already has AuthInterceptor attached
) {
    /**
     * The generated IotScalesApi types the status response as Response<Unit>,
     * so Retrofit's converter eats the JSON body. We use raw OkHttp instead.
     */
    suspend fun getStatus(): Result<IotStatus> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "getStatus: fetching IoT scale status…")
            val request = Request.Builder()
                .url("${BuildConfig.API_BASE_URL}iot/scales/status")
                .get()
                .build()
            val response = okHttpClient.newCall(request).execute()
            val body = response.body?.string() ?: "{}"
            Log.d(TAG, "getStatus: HTTP ${response.code} body=$body")

            val json = JSONObject(body)
            val status = IotStatus(
                isLinked = json.optBoolean("is_linked", false),
                serialNumber = json.optString("serial_number")
                    .takeIf { it.isNotBlank() && it != "null" }
            )
            Log.d(TAG, "getStatus: isLinked=${status.isLinked} serial=${status.serialNumber}")
            Result.success(status)
        } catch (e: Exception) {
            Log.e(TAG, "getStatus: FAILED", e)
            Result.failure(e)
        }
    }

    suspend fun linkDevice(serialNumber: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "linkDevice: linking serial=$serialNumber")
            val resp = iotScalesApi.iotControllerLinkDevice(LinkDeviceDto(serialNumber))
            if (resp.isSuccessful) {
                Log.d(TAG, "linkDevice: SUCCESS")
                Result.success(Unit)
            } else {
                val errBody = resp.errorBody()?.string()
                val err = "Failed to link device (HTTP ${resp.code()}) $errBody"
                Log.e(TAG, "linkDevice: $err")
                Result.failure(Exception(err))
            }
        } catch (e: Exception) {
            Log.e(TAG, "linkDevice: FAILED", e)
            Result.failure(e)
        }
    }

    suspend fun unlinkDevice(): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "unlinkDevice: unlinking…")
            val resp = iotScalesApi.iotControllerUnlinkDevice()
            if (resp.isSuccessful) {
                Log.d(TAG, "unlinkDevice: SUCCESS")
                Result.success(Unit)
            } else {
                val err = "Failed to unlink device (HTTP ${resp.code()})"
                Log.e(TAG, "unlinkDevice: $err")
                Result.failure(Exception(err))
            }
        } catch (e: Exception) {
            Log.e(TAG, "unlinkDevice: FAILED", e)
            Result.failure(e)
        }
    }
}
