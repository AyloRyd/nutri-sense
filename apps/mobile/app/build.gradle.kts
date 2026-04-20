plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.openapi.generator")
    id("dagger.hilt.android.plugin")
    id("kotlin-kapt")
    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.20"
}

android {
    namespace = "com.nutrisense.mobile"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.nutrisense.mobile"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.4"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildTypes {
        debug {
            buildConfigField("String", "API_BASE_URL", "\"https://nutri-sense-api.onrender.com/\"")
        }
        release {
            isMinifyEnabled = true
            buildConfigField("String", "API_BASE_URL", "\"https://nutri-sense-api.onrender.com/\"")
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation(platform("androidx.compose:compose-bom:2023.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    
    // Retrofit & Moshi
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-moshi:2.9.0")
    implementation("com.squareup.moshi:moshi-kotlin:1.15.0")
    
    // Hilt
    implementation("com.google.dagger:hilt-android:2.50")
    kapt("com.google.dagger:hilt-compiler:2.50")
    
    // OpenAPI Dependencies
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.squareup.retrofit2:converter-scalars:2.9.0")
    
    // Navigation & Serialization
    implementation("androidx.navigation:navigation-compose:2.8.2")
    implementation("androidx.hilt:hilt-navigation-compose:1.2.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
    
    // Security
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
}

openApiGenerate {
    generatorName.set("kotlin")
    inputSpec.set("$rootDir/../../openapi.json")
    outputDir.set(layout.buildDirectory.dir("generated/openapi").get().asFile.absolutePath)
    apiPackage.set("com.nutrisense.mobile.api")
    modelPackage.set("com.nutrisense.mobile.model")
    configOptions.set(mapOf(
        "library" to "jvm-retrofit2",
        "serializationLibrary" to "moshi",
        "useCoroutines" to "true",
        "enumPropertyNaming" to "UPPERCASE"
    ))
}

// Add generated code to source sets
android.sourceSets {
    getByName("main") {
        java.srcDir(layout.buildDirectory.dir("generated/openapi/src/main/kotlin").get().asFile)
    }
}

tasks.whenTaskAdded {
    if (name.startsWith("compile") && name.endsWith("Kotlin") || name.startsWith("kapt")) {
        dependsOn("openApiGenerate")
    }
}
