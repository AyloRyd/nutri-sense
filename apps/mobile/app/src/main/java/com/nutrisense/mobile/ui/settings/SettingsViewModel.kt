package com.nutrisense.mobile.ui.settings

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nutrisense.mobile.api.AuthApi
import com.nutrisense.mobile.api.UsersApi
import com.nutrisense.mobile.data.IotRepository
import com.nutrisense.mobile.data.security.PreferencesManager
import com.nutrisense.mobile.data.security.TokenManager
import com.nutrisense.mobile.model.ChangePasswordDto
import com.nutrisense.mobile.model.UpdateUserDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

private const val TAG = "SettingsVM"

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val usersApi: UsersApi,
    private val authApi: AuthApi,
    private val iotRepository: IotRepository,
    private val tokenManager: TokenManager,
    private val preferencesManager: PreferencesManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    /** The last serial the user typed, persisted across app restarts */
    val savedSerial: String get() = preferencesManager.getIotSerial()

    init { load() }

    fun load() {
        Log.d(TAG, "load: fetching settings data")
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val userResp = usersApi.usersControllerGetMe()
                Log.d(TAG, "load: user HTTP ${userResp.code()}")
                val iotResult = iotRepository.getStatus()
                Log.d(TAG, "load: iot result=${iotResult.isSuccess}")
                if (userResp.isSuccessful) {
                    Log.d(TAG, "load: SUCCESS user=${userResp.body()?.username}")
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            user = userResp.body(),
                            iotStatus = iotResult.getOrNull()
                        )
                    }
                } else {
                    Log.e(TAG, "load: user FAILED HTTP ${userResp.code()}")
                    _uiState.update { it.copy(isLoading = false, error = "Failed to load settings") }
                }
            } catch (e: Exception) {
                Log.e(TAG, "load: EXCEPTION", e)
                _uiState.update { it.copy(isLoading = false, error = e.message ?: "Network error") }
            }
        }
    }

    fun updateProfile(username: String, dateOfBirth: String?, sex: UpdateUserDto.Sex?) {
        Log.d(TAG, "updateProfile: username=$username dob=$dateOfBirth sex=$sex")
        val userId = _uiState.value.user?.id?.toString() ?: return
        _uiState.update { it.copy(isUpdatingProfile = true, profileMsg = null) }
        viewModelScope.launch {
            try {
                val dob = dateOfBirth?.takeIf { it.isNotBlank() }?.let {
                    java.time.OffsetDateTime.parse("${it}T00:00:00Z")
                }
                val resp = usersApi.usersControllerUpdate(
                    userId,
                    UpdateUserDto(username = username, sex = sex, dateOfBirth = dob)
                )
                Log.d(TAG, "updateProfile: HTTP ${resp.code()}")
                if (resp.isSuccessful) {
                    Log.d(TAG, "updateProfile: SUCCESS")
                    _uiState.update { it.copy(isUpdatingProfile = false, user = resp.body(),
                        profileMsg = Pair(true, "Profile updated")) }
                } else {
                    Log.e(TAG, "updateProfile: FAILED HTTP ${resp.code()}")
                    _uiState.update { it.copy(isUpdatingProfile = false,
                        profileMsg = Pair(false, "Update failed")) }
                }
            } catch (e: Exception) {
                Log.e(TAG, "updateProfile: EXCEPTION", e)
                _uiState.update { it.copy(isUpdatingProfile = false,
                    profileMsg = Pair(false, e.message ?: "Error")) }
            }
            delay(3000)
            _uiState.update { it.copy(profileMsg = null) }
        }
    }

    fun changePassword(oldPassword: String, newPassword: String) {
        Log.d(TAG, "changePassword: attempting")
        _uiState.update { it.copy(isChangingPassword = true, passwordMsg = null) }
        viewModelScope.launch {
            try {
                val resp = authApi.authControllerChangePassword(
                    ChangePasswordDto(password = oldPassword, newPassword = newPassword)
                )
                Log.d(TAG, "changePassword: HTTP ${resp.code()}")
                if (resp.isSuccessful) {
                    Log.d(TAG, "changePassword: SUCCESS")
                    _uiState.update { it.copy(isChangingPassword = false,
                        passwordMsg = Pair(true, "Password changed")) }
                } else {
                    Log.e(TAG, "changePassword: FAILED HTTP ${resp.code()}")
                    _uiState.update { it.copy(isChangingPassword = false,
                        passwordMsg = Pair(false, "Wrong current password")) }
                }
            } catch (e: Exception) {
                Log.e(TAG, "changePassword: EXCEPTION", e)
                _uiState.update { it.copy(isChangingPassword = false,
                    passwordMsg = Pair(false, e.message ?: "Error")) }
            }
            delay(3000)
            _uiState.update { it.copy(passwordMsg = null) }
        }
    }

    fun linkDevice(serialNumber: String) {
        Log.d(TAG, "linkDevice: serial=$serialNumber")
        // Persist the serial so user doesn't have to retype next time
        preferencesManager.saveIotSerial(serialNumber)

        _uiState.update { it.copy(isLinkingDevice = true, iotMsg = null) }
        viewModelScope.launch {
            val result = iotRepository.linkDevice(serialNumber)
            if (result.isSuccess) {
                Log.d(TAG, "linkDevice: SUCCESS, re-fetching status")
                val newStatus = iotRepository.getStatus().getOrNull()
                Log.d(TAG, "linkDevice: newStatus isLinked=${newStatus?.isLinked}")
                _uiState.update { it.copy(
                    isLinkingDevice = false,
                    iotStatus = newStatus,
                    iotMsg = Pair(true, "Device linked")
                ) }
            } else {
                Log.e(TAG, "linkDevice: FAILED — ${result.exceptionOrNull()?.message}")
                _uiState.update { it.copy(isLinkingDevice = false,
                    iotMsg = Pair(false, result.exceptionOrNull()?.message ?: "Link failed")) }
            }
            delay(3000)
            _uiState.update { it.copy(iotMsg = null) }
        }
    }

    fun unlinkDevice() {
        Log.d(TAG, "unlinkDevice: starting")
        _uiState.update { it.copy(isUnlinkingDevice = true, iotMsg = null) }
        viewModelScope.launch {
            val result = iotRepository.unlinkDevice()
            if (result.isSuccess) {
                Log.d(TAG, "unlinkDevice: SUCCESS")
                val newStatus = iotRepository.getStatus().getOrNull()
                _uiState.update { it.copy(
                    isUnlinkingDevice = false,
                    iotStatus = newStatus,
                    iotMsg = Pair(true, "Device unlinked")
                ) }
            } else {
                Log.e(TAG, "unlinkDevice: FAILED — ${result.exceptionOrNull()?.message}")
                _uiState.update { it.copy(isUnlinkingDevice = false,
                    iotMsg = Pair(false, result.exceptionOrNull()?.message ?: "Unlink failed")) }
            }
            delay(3000)
            _uiState.update { it.copy(iotMsg = null) }
        }
    }

    fun deleteAccount(onDone: () -> Unit) {
        Log.d(TAG, "deleteAccount: starting")
        val userId = _uiState.value.user?.id?.toString() ?: return
        _uiState.update { it.copy(isDeletingAccount = true) }
        viewModelScope.launch {
            try {
                usersApi.usersControllerRemove(userId)
                tokenManager.clearToken()
                preferencesManager.clearIotSerial()
                onDone()
            } catch (e: Exception) {
                _uiState.update { it.copy(isDeletingAccount = false,
                    error = e.message ?: "Delete failed") }
            }
        }
    }
}
