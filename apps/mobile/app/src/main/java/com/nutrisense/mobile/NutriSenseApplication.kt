package com.nutrisense.mobile

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class NutriSenseApplication : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
