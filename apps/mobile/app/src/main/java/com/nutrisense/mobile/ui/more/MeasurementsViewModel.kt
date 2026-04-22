package com.nutrisense.mobile.ui.more

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nutrisense.mobile.api.MeasurementsApi
import com.nutrisense.mobile.model.CreateMeasurementDto
import com.nutrisense.mobile.model.MeasurementEntity
import com.nutrisense.mobile.model.UpdateMeasurementDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

private const val TAG = "MeasurementsVM"

data class MeasurementsUiState(
    val isLoading: Boolean = true,
    val measurements: List<MeasurementEntity> = emptyList(),
    val isCreating: Boolean = false,
    val error: String? = null,
    val successMsg: String? = null
)

@HiltViewModel
class MeasurementsViewModel @Inject constructor(
    private val api: MeasurementsApi
) : ViewModel() {

    private val _uiState = MutableStateFlow(MeasurementsUiState())
    val uiState: StateFlow<MeasurementsUiState> = _uiState.asStateFlow()

    init { load() }

    fun load() {
        Log.d(TAG, "load: fetching measurements")
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val resp = api.measurementsControllerFindAll()
                Log.d(TAG, "load: HTTP ${resp.code()} count=${resp.body()?.size}")
                if (resp.isSuccessful) {
                    _uiState.update { it.copy(isLoading = false, measurements = resp.body() ?: emptyList()) }
                } else {
                    _uiState.update { it.copy(isLoading = false, error = "Failed to load") }
                }
            } catch (e: Exception) {
                Log.e(TAG, "load: EXCEPTION", e)
                _uiState.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }

    fun create(weight: Double, height: Double, activity: Double, date: String) {
        Log.d(TAG, "create: w=$weight h=$height a=$activity d=$date")
        _uiState.update { it.copy(isCreating = true, error = null) }
        viewModelScope.launch {
            try {
                val dto = CreateMeasurementDto(
                    weight = weight.toBigDecimal(),
                    height = height.toBigDecimal(),
                    activity = activity.toBigDecimal(),
                    date = date
                )
                val resp = api.measurementsControllerCreate(dto)
                Log.d(TAG, "create: HTTP ${resp.code()}")
                if (resp.isSuccessful) {
                    _uiState.update { it.copy(isCreating = false, successMsg = "Measurement added") }
                    load()
                } else {
                    val errBody = resp.errorBody()?.string()
                    Log.e(TAG, "create: FAILED $errBody")
                    _uiState.update { it.copy(isCreating = false, error = "Create failed: $errBody") }
                }
            } catch (e: Exception) {
                Log.e(TAG, "create: EXCEPTION", e)
                _uiState.update { it.copy(isCreating = false, error = e.message) }
            }
        }
    }

    fun update(id: java.math.BigDecimal, weight: Double, height: Double, activity: Double, date: String) {
        _uiState.update { it.copy(isCreating = true, error = null) }
        viewModelScope.launch {
            try {
                val dto = UpdateMeasurementDto(
                    weight = weight.toBigDecimal(),
                    height = height.toBigDecimal(),
                    activity = activity.toBigDecimal(),
                    date = date
                )
                val resp = api.measurementsControllerUpdate(id, dto)
                if (resp.isSuccessful) {
                    _uiState.update { it.copy(isCreating = false, successMsg = "Measurement updated") }
                    load()
                } else {
                    val errBody = resp.errorBody()?.string()
                    _uiState.update { it.copy(isCreating = false, error = "Update failed: $errBody") }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isCreating = false, error = e.message) }
            }
        }
    }

    fun delete(id: java.math.BigDecimal) {
        Log.d(TAG, "delete: id=$id")
        viewModelScope.launch {
            try {
                api.measurementsControllerRemove(id)
                load()
            } catch (e: Exception) {
                Log.e(TAG, "delete: EXCEPTION", e)
            }
        }
    }

    fun clearSuccess() { _uiState.update { it.copy(successMsg = null) } }
}
