package com.nutrisense.mobile.ui.dashboard

import com.nutrisense.mobile.data.DashboardData

sealed interface DashboardUiState {
    data object Loading : DashboardUiState
    data class Success(val data: DashboardData) : DashboardUiState
    data class Error(val message: String) : DashboardUiState
}
