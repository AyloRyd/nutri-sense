package com.nutrisense.mobile.di

import com.nutrisense.mobile.api.AuthApi
import com.nutrisense.mobile.api.IotScalesApi
import com.nutrisense.mobile.api.MeasurementsApi
import com.nutrisense.mobile.api.PlansApi
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
        // OpenAPI's default BigDecimalAdapter serializes as a String.
        // NestJS strict validation expects numbers. We override it here.
        val customMoshi = com.squareup.moshi.Moshi.Builder()
            .add(org.openapitools.client.infrastructure.OffsetDateTimeAdapter())
            .add(org.openapitools.client.infrastructure.LocalDateTimeAdapter())
            .add(org.openapitools.client.infrastructure.LocalDateAdapter())
            .add(org.openapitools.client.infrastructure.UUIDAdapter())
            .add(org.openapitools.client.infrastructure.ByteArrayAdapter())
            .add(org.openapitools.client.infrastructure.URIAdapter())
            .add(com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory())
            .add(java.math.BigDecimal::class.java, object : com.squareup.moshi.JsonAdapter<java.math.BigDecimal>() {
                override fun fromJson(reader: com.squareup.moshi.JsonReader): java.math.BigDecimal? {
                    if (reader.peek() == com.squareup.moshi.JsonReader.Token.NULL) return reader.nextNull()
                    return reader.nextDouble().toBigDecimal()
                }

                override fun toJson(writer: com.squareup.moshi.JsonWriter, value: java.math.BigDecimal?) {
                    if (value == null) writer.nullValue()
                    else writer.value(value)
                }
            })
            .add(org.openapitools.client.infrastructure.BigIntegerAdapter())
            .build()

        return ApiClient(
            baseUrl = BuildConfig.API_BASE_URL,
            okHttpClientBuilder = okHttpClient.newBuilder(),
            serializerBuilder = customMoshi.newBuilder()
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

    @Provides @Singleton
    fun provideMeasurementsApi(apiClient: ApiClient): MeasurementsApi =
        apiClient.createService(MeasurementsApi::class.java)

    @Provides @Singleton
    fun providePlansApi(apiClient: ApiClient): PlansApi =
        apiClient.createService(PlansApi::class.java)
}
