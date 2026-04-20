package com.nutrisense.mobile.data

import android.util.Log
import com.nutrisense.mobile.api.AuthApi
import com.nutrisense.mobile.model.AuthEntity
import com.nutrisense.mobile.model.LoginDto
import com.nutrisense.mobile.model.RegisterDto
import com.nutrisense.mobile.data.security.TokenManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

private const val TAG = "AuthRepository"

@Singleton
class AuthRepository @Inject constructor(
    private val authApi: AuthApi,
    private val tokenManager: TokenManager
) {

    fun hasValidToken(): Boolean = tokenManager.getToken() != null

    fun logout() {
        Log.d(TAG, "logout: clearing token")
        tokenManager.clearToken()
    }

    private fun <T> parseError(response: retrofit2.Response<T>, fallback: String): String {
        return try {
            val body = response.errorBody()?.string() ?: return fallback
            val json = JSONObject(body)
            json.optJSONObject("error")?.optString("message")?.takeIf { it.isNotBlank() }
                ?: json.optString("message").takeIf { it.isNotBlank() }
                ?: fallback
        } catch (e: Exception) {
            fallback
        }
    }

    suspend fun login(loginDto: LoginDto): Flow<Result<AuthEntity>> = flow {
        try {
            Log.d(TAG, "login: attempting login for ${loginDto.email}")
            val response = authApi.authControllerLogin(loginDto)
            if (response.isSuccessful && response.body() != null) {
                val authEntity = response.body()!!
                tokenManager.saveToken(authEntity.accessToken)
                Log.d(TAG, "login: SUCCESS")
                emit(Result.success(authEntity))
            } else {
                val msg = parseError(response, "Authentication failed")
                Log.e(TAG, "login: FAILED HTTP ${response.code()} — $msg")
                emit(Result.failure(Exception(msg)))
            }
        } catch (e: Exception) {
            Log.e(TAG, "login: EXCEPTION", e)
            emit(Result.failure(Exception(e.message ?: "Network error — check your connection")))
        }
    }.flowOn(Dispatchers.IO)

    suspend fun register(registerDto: RegisterDto): Flow<Result<AuthEntity>> = flow {
        try {
            Log.d(TAG, "register: attempting registration for ${registerDto.email}")
            val response = authApi.authControllerRegister(registerDto)
            if (response.isSuccessful && response.body() != null) {
                val authEntity = response.body()!!
                tokenManager.saveToken(authEntity.accessToken)
                Log.d(TAG, "register: SUCCESS")
                emit(Result.success(authEntity))
            } else {
                val msg = parseError(response, "Registration failed")
                Log.e(TAG, "register: FAILED HTTP ${response.code()} — $msg")
                emit(Result.failure(Exception(msg)))
            }
        } catch (e: Exception) {
            Log.e(TAG, "register: EXCEPTION", e)
            emit(Result.failure(Exception(e.message ?: "Network error — check your connection")))
        }
    }.flowOn(Dispatchers.IO)
}
