package com.nutrisense.mobile.ui.settings

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
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val userResp = usersApi.usersControllerGetMe()
                val iotResult = iotRepository.getStatus()
                if (userResp.isSuccessful) {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            user = userResp.body(),
                            iotStatus = iotResult.getOrNull()
                        )
                    }
                } else {
                    _uiState.update { it.copy(isLoading = false, error = "Failed to load settings") }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.message ?: "Network error") }
            }
        }
    }

    fun updateProfile(username: String, dateOfBirth: String?, sex: UpdateUserDto.Sex?) {
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
                if (resp.isSuccessful) {
                    _uiState.update { it.copy(isUpdatingProfile = false, user = resp.body(),
                        profileMsg = Pair(true, "Profile updated")) }
                } else {
                    _uiState.update { it.copy(isUpdatingProfile = false,
                        profileMsg = Pair(false, "Update failed")) }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isUpdatingProfile = false,
                    profileMsg = Pair(false, e.message ?: "Error")) }
            }
            delay(3000)
            _uiState.update { it.copy(profileMsg = null) }
        }
    }

    fun changePassword(oldPassword: String, newPassword: String) {
        _uiState.update { it.copy(isChangingPassword = true, passwordMsg = null) }
        viewModelScope.launch {
            try {
                val resp = authApi.authControllerChangePassword(
                    ChangePasswordDto(password = oldPassword, newPassword = newPassword)
                )
                if (resp.isSuccessful) {
                    _uiState.update { it.copy(isChangingPassword = false,
                        passwordMsg = Pair(true, "Password changed")) }
                } else {
                    _uiState.update { it.copy(isChangingPassword = false,
                        passwordMsg = Pair(false, "Wrong current password")) }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isChangingPassword = false,
                    passwordMsg = Pair(false, e.message ?: "Error")) }
            }
            delay(3000)
            _uiState.update { it.copy(passwordMsg = null) }
        }
    }

    fun linkDevice(serialNumber: String) {
        // Persist the serial so user doesn't have to retype next time
        preferencesManager.saveIotSerial(serialNumber)

        _uiState.update { it.copy(isLinkingDevice = true, iotMsg = null) }
        viewModelScope.launch {
            val result = iotRepository.linkDevice(serialNumber)
            if (result.isSuccess) {
                // Re-fetch status from server for ground truth
                val newStatus = iotRepository.getStatus().getOrNull()
                _uiState.update { it.copy(
                    isLinkingDevice = false,
                    iotStatus = newStatus,
                    iotMsg = Pair(true, "Device linked")
                ) }
            } else {
                _uiState.update { it.copy(isLinkingDevice = false,
                    iotMsg = Pair(false, result.exceptionOrNull()?.message ?: "Link failed")) }
            }
            delay(3000)
            _uiState.update { it.copy(iotMsg = null) }
        }
    }

    fun unlinkDevice() {
        _uiState.update { it.copy(isUnlinkingDevice = true, iotMsg = null) }
        viewModelScope.launch {
            val result = iotRepository.unlinkDevice()
            if (result.isSuccess) {
                preferencesManager.clearIotSerial()
                // Re-fetch for ground truth
                val newStatus = iotRepository.getStatus().getOrNull()
                _uiState.update { it.copy(
                    isUnlinkingDevice = false,
                    iotStatus = newStatus,
                    iotMsg = Pair(true, "Device unlinked")
                ) }
            } else {
                _uiState.update { it.copy(isUnlinkingDevice = false,
                    iotMsg = Pair(false, result.exceptionOrNull()?.message ?: "Unlink failed")) }
            }
            delay(3000)
            _uiState.update { it.copy(iotMsg = null) }
        }
    }

    fun deleteAccount(onDone: () -> Unit) {
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
