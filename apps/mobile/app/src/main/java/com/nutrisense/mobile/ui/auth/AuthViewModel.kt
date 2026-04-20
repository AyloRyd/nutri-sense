package com.nutrisense.mobile.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nutrisense.mobile.data.AuthRepository
import com.nutrisense.mobile.model.LoginDto
import com.nutrisense.mobile.model.RegisterDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun onUsernameChange(username: String) {
        _uiState.update { it.copy(username = username, error = null) }
    }

    fun onEmailChange(email: String) {
        _uiState.update { it.copy(email = email, error = null) }
    }

    fun onPasswordChange(password: String) {
        _uiState.update { it.copy(password = password, error = null) }
    }

    fun login(onSuccess: () -> Unit) {
        if (_uiState.value.email.isBlank() || _uiState.value.password.isBlank()) {
            _uiState.update { it.copy(error = "Email and Password cannot be empty") }
            return
        }

        _uiState.update { it.copy(isLoading = true, error = null) }
        
        viewModelScope.launch {
            authRepository.login(
                LoginDto(
                    email = _uiState.value.email,
                    password = _uiState.value.password
                )
            ).collect { result ->
                if (result.isSuccess) {
                    _uiState.update { it.copy(isLoading = false, error = null) }
                    onSuccess()
                } else {
                    _uiState.update { it.copy(isLoading = false, error = result.exceptionOrNull()?.message ?: "Login failed") }
                }
            }
        }
    }

    fun register(onSuccess: () -> Unit) {
        if (_uiState.value.username.isBlank() || _uiState.value.email.isBlank() || _uiState.value.password.isBlank()) {
            _uiState.update { it.copy(error = "All fields are required") }
            return
        }

        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            authRepository.register(
                RegisterDto(
                    username = _uiState.value.username,
                    email = _uiState.value.email,
                    password = _uiState.value.password
                )
            ).collect { result ->
                if (result.isSuccess) {
                    _uiState.update { it.copy(isLoading = false, error = null) }
                    onSuccess()
                } else {
                    _uiState.update { it.copy(isLoading = false, error = result.exceptionOrNull()?.message ?: "Registration failed") }
                }
            }
        }
    }
}
