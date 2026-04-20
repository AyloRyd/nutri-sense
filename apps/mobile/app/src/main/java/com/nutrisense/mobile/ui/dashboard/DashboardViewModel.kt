package com.nutrisense.mobile.ui.dashboard

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nutrisense.mobile.data.DashboardRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

private const val TAG = "DashboardVM"

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val repository: DashboardRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        Log.d(TAG, "load: starting dashboard fetch")
        _uiState.value = DashboardUiState.Loading
        viewModelScope.launch {
            repository.loadDashboard().collect { result ->
                _uiState.value = if (result.isSuccess) {
                    Log.d(TAG, "load: SUCCESS — user=${result.getOrThrow().username}")
                    DashboardUiState.Success(result.getOrThrow())
                } else {
                    val msg = result.exceptionOrNull()?.message ?: "Unknown error"
                    Log.e(TAG, "load: ERROR — $msg")
                    DashboardUiState.Error(msg)
                }
            }
        }
    }
}
