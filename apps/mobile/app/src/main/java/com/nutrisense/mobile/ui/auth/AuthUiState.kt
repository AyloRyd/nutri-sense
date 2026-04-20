package com.nutrisense.mobile.ui.auth

data class AuthUiState(
    val username: String = "",
    val email: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val error: String? = null
)
