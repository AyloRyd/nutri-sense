package com.nutrisense.mobile.di

import com.nutrisense.mobile.api.AuthApi
import com.nutrisense.mobile.api.IotScalesApi
import com.nutrisense.mobile.api.StatsApi
import com.nutrisense.mobile.api.UsersApi
import com.nutrisense.mobile.BuildConfig
import com.nutrisense.mobile.data.security.AuthInterceptor
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import org.openapitools.client.infrastructure.ApiClient
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(authInterceptor: AuthInterceptor): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .build()
    }

    @Provides
    @Singleton
    fun provideApiClient(okHttpClient: OkHttpClient): ApiClient {
        return ApiClient(
            baseUrl = BuildConfig.API_BASE_URL,
            okHttpClientBuilder = okHttpClient.newBuilder()
        )
    }

    @Provides @Singleton
    fun provideAuthApi(apiClient: ApiClient): AuthApi =
        apiClient.createService(AuthApi::class.java)

    @Provides @Singleton
    fun provideStatsApi(apiClient: ApiClient): StatsApi =
        apiClient.createService(StatsApi::class.java)

    @Provides @Singleton
    fun provideUsersApi(apiClient: ApiClient): UsersApi =
        apiClient.createService(UsersApi::class.java)

    @Provides @Singleton
    fun provideIotScalesApi(apiClient: ApiClient): IotScalesApi =
        apiClient.createService(IotScalesApi::class.java)
}
