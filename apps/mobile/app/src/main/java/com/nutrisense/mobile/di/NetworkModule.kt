package com.nutrisense.mobile.di

import com.nutrisense.mobile.api.AuthApi
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
        val baseUrl = BuildConfig.API_BASE_URL
        
        return ApiClient(
            baseUrl = baseUrl,
            okHttpClientBuilder = okHttpClient.newBuilder()
        )
    }

    @Provides
    @Singleton
    fun provideAuthApi(apiClient: ApiClient): AuthApi {
        return apiClient.createService(AuthApi::class.java)
    }
}
