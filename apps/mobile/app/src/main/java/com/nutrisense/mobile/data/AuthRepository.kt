package com.nutrisense.mobile.data

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

@Singleton
class AuthRepository @Inject constructor(
    private val authApi: AuthApi,
    private val tokenManager: TokenManager
) {

    fun hasValidToken(): Boolean = tokenManager.getToken() != null

    fun logout() = tokenManager.clearToken()

    // NestJS returns: {"statusCode":404,"error":{"message":"..."},...}
    private fun <T> parseError(response: retrofit2.Response<T>, fallback: String): String {
        return try {
            val body = response.errorBody()?.string() ?: return fallback
            val json = JSONObject(body)
            // Try nested error.message first, then top-level message
            json.optJSONObject("error")?.optString("message")?.takeIf { it.isNotBlank() }
                ?: json.optString("message").takeIf { it.isNotBlank() }
                ?: fallback
        } catch (e: Exception) {
            fallback
        }
    }

    suspend fun login(loginDto: LoginDto): Flow<Result<AuthEntity>> = flow {
        try {
            val response = authApi.authControllerLogin(loginDto)
            if (response.isSuccessful && response.body() != null) {
                val authEntity = response.body()!!
                tokenManager.saveToken(authEntity.accessToken)
                emit(Result.success(authEntity))
            } else {
                emit(Result.failure(Exception(parseError(response, "Authentication failed"))))
            }
        } catch (e: Exception) {
            emit(Result.failure(Exception(e.message ?: "Network error — check your connection")))
        }
    }.flowOn(Dispatchers.IO)

    suspend fun register(registerDto: RegisterDto): Flow<Result<AuthEntity>> = flow {
        try {
            val response = authApi.authControllerRegister(registerDto)
            if (response.isSuccessful && response.body() != null) {
                val authEntity = response.body()!!
                tokenManager.saveToken(authEntity.accessToken)
                emit(Result.success(authEntity))
            } else {
                emit(Result.failure(Exception(parseError(response, "Registration failed"))))
            }
        } catch (e: Exception) {
            emit(Result.failure(Exception(e.message ?: "Network error — check your connection")))
        }
    }.flowOn(Dispatchers.IO)
}
