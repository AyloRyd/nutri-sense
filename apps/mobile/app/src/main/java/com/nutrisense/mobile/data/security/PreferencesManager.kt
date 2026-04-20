package com.nutrisense.mobile.data.security

import android.content.Context
import android.content.SharedPreferences
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Simple SharedPreferences for non-sensitive app settings (e.g. last IoT serial).
 * Unlike TokenManager, this does NOT use EncryptedSharedPreferences — serial numbers
 * aren't secret and encryption adds startup cost.
 */
@Singleton
class PreferencesManager @Inject constructor(@ApplicationContext context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("nutrisense_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_IOT_SERIAL = "iot_serial_number"
    }

    fun saveIotSerial(serial: String) {
        prefs.edit().putString(KEY_IOT_SERIAL, serial).apply()
    }

    fun getIotSerial(): String {
        return prefs.getString(KEY_IOT_SERIAL, "") ?: ""
    }

    fun clearIotSerial() {
        prefs.edit().remove(KEY_IOT_SERIAL).apply()
    }
}
