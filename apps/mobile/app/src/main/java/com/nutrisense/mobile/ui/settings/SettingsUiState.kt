package com.nutrisense.mobile.ui.settings

import com.nutrisense.mobile.data.IotStatus
import com.nutrisense.mobile.model.UserEntity

data class SettingsUiState(
    val isLoading: Boolean = true,
    val user: UserEntity? = null,
    val iotStatus: IotStatus? = null,
    // Per-section loading flags
    val isUpdatingProfile: Boolean = false,
    val isChangingPassword: Boolean = false,
    val isLinkingDevice: Boolean = false,
    val isUnlinkingDevice: Boolean = false,
    val isDeletingAccount: Boolean = false,
    // Transient messages (section → Pair(isSuccess, message))
    val profileMsg: Pair<Boolean, String>? = null,
    val passwordMsg: Pair<Boolean, String>? = null,
    val iotMsg: Pair<Boolean, String>? = null,
    val error: String? = null
)
