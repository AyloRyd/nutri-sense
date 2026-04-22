package com.nutrisense.mobile.ui.more

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nutrisense.mobile.api.MeasurementsApi
import com.nutrisense.mobile.api.PlansApi
import com.nutrisense.mobile.api.UsersApi
import com.nutrisense.mobile.model.CreatePlanDto
import com.nutrisense.mobile.model.MeasurementEntity
import com.nutrisense.mobile.model.PlanEntity
import com.nutrisense.mobile.model.UpdatePlanDto
import com.nutrisense.mobile.model.UserEntity
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

private const val TAG = "PlansVM"

data class PlansUiState(
    val isLoading: Boolean = true,
    val plans: List<PlanEntity> = emptyList(),
    val isCreating: Boolean = false,
    val error: String? = null,
    val successMsg: String? = null,
    // Prerequisites check
    val user: UserEntity? = null,
    val hasMeasurements: Boolean = false
) {
    /** True when user is missing sex, date_of_birth, or has no measurements */
    val missingProfileData: Boolean
        get() {
            val currentUser = user
            return currentUser == null || currentUser.sex == null || currentUser.dateOfBirth == null || !hasMeasurements
        }

    val hasProfile: Boolean
        get() {
            val currentUser = user ?: return false
            return currentUser.sex != null && currentUser.dateOfBirth != null
        }
}

@HiltViewModel
class PlansViewModel @Inject constructor(
    private val plansApi: PlansApi,
    private val usersApi: UsersApi,
    private val measurementsApi: MeasurementsApi
) : ViewModel() {

    private val _uiState = MutableStateFlow(PlansUiState())
    val uiState: StateFlow<PlansUiState> = _uiState.asStateFlow()

    init { load() }

    fun load() {
        Log.d(TAG, "load: fetching plans + prerequisites")
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                coroutineScope {
                    val plansDeferred = async { plansApi.plansControllerFindAll() }
                    val userDeferred = async { usersApi.usersControllerGetMe() }
                    val measDeferred = async { measurementsApi.measurementsControllerFindAll() }

                    val plansResp = plansDeferred.await()
                    val userResp = userDeferred.await()
                    val measResp = measDeferred.await()

                    Log.d(TAG, "load: plans=${plansResp.code()} user=${userResp.code()} meas=${measResp.code()}")

                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            plans = if (plansResp.isSuccessful) plansResp.body() ?: emptyList() else emptyList(),
                            user = if (userResp.isSuccessful) userResp.body() else null,
                            hasMeasurements = if (measResp.isSuccessful) (measResp.body()?.isNotEmpty() == true) else false
                        )
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "load: EXCEPTION", e)
                _uiState.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }

    fun create(startDate: String, goal: CreatePlanDto.Goal, isAutoCalc: Boolean,
               calories: Int?, protein: Int?, fats: Int?, carbs: Int?) {
        Log.d(TAG, "create: date=$startDate goal=$goal auto=$isAutoCalc")
        _uiState.update { it.copy(isCreating = true, error = null) }
        viewModelScope.launch {
            try {
                val dto = CreatePlanDto(
                    startDate = startDate,
                    goal = goal,
                    dayCalories = if (!isAutoCalc) calories?.toBigDecimal() else null,
                    dayProtein = if (!isAutoCalc) protein?.toBigDecimal() else null,
                    dayFats = if (!isAutoCalc) fats?.toBigDecimal() else null,
                    dayCarbs = if (!isAutoCalc) carbs?.toBigDecimal() else null
                )
                val resp = plansApi.plansControllerCreate(dto)
                Log.d(TAG, "create: HTTP ${resp.code()}")
                if (resp.isSuccessful) {
                    _uiState.update { it.copy(isCreating = false, successMsg = "Plan created") }
                    load()
                } else {
                    val errBody = resp.errorBody()?.string() ?: "Create failed"
                    Log.e(TAG, "create: FAILED $errBody")
                    _uiState.update { it.copy(isCreating = false, error = errBody) }
                }
            } catch (e: Exception) {
                Log.e(TAG, "create: EXCEPTION", e)
                _uiState.update { it.copy(isCreating = false, error = e.message) }
            }
        }
    }

    fun update(
        id: java.math.BigDecimal,
        startDate: String,
        goal: CreatePlanDto.Goal,
        isAutoCalc: Boolean,
        calories: Int?,
        protein: Int?,
        fats: Int?,
        carbs: Int?
    ) {
        _uiState.update { it.copy(isCreating = true, error = null) }
        viewModelScope.launch {
            try {
                val dto = UpdatePlanDto(
                    startDate = startDate,
                    goal = when (goal) {
                        CreatePlanDto.Goal.MAINTAIN -> UpdatePlanDto.Goal.MAINTAIN
                        CreatePlanDto.Goal.GAIN -> UpdatePlanDto.Goal.GAIN
                        CreatePlanDto.Goal.LOSE -> UpdatePlanDto.Goal.LOSE
                    },
                    dayCalories = if (!isAutoCalc) calories?.toBigDecimal() else null,
                    dayProtein = if (!isAutoCalc) protein?.toBigDecimal() else null,
                    dayFats = if (!isAutoCalc) fats?.toBigDecimal() else null,
                    dayCarbs = if (!isAutoCalc) carbs?.toBigDecimal() else null
                )
                val resp = plansApi.plansControllerUpdate(id, dto)
                if (resp.isSuccessful) {
                    _uiState.update { it.copy(isCreating = false, successMsg = "Plan updated") }
                    load()
                } else {
                    val errBody = resp.errorBody()?.string() ?: "Update failed"
                    _uiState.update { it.copy(isCreating = false, error = errBody) }
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
                plansApi.plansControllerRemove(id)
                load()
            } catch (e: Exception) {
                Log.e(TAG, "delete: EXCEPTION", e)
            }
        }
    }

    fun clearSuccess() { _uiState.update { it.copy(successMsg = null) } }
}
