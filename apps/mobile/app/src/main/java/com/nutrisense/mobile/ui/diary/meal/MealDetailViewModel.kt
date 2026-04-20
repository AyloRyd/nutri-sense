package com.nutrisense.mobile.ui.diary.meal

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nutrisense.mobile.data.MealsRepository
import com.nutrisense.mobile.data.OpenfoodfactsRepository
import com.nutrisense.mobile.model.CreateMealFoodDto
import com.nutrisense.mobile.model.MealEntity
import com.nutrisense.mobile.model.UpdateMealFoodDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.math.BigDecimal
import javax.inject.Inject

data class MealFoodFormState(
    val name: String = "",
    val weight: String = "100",
    val calories: String = "0",
    val protein: String = "0",
    val fats: String = "0",
    val carbs: String = "0"
)

data class MealDetailUiState(
    val mealId: Int = -1,
    val meal: MealEntity? = null,
    val isLoading: Boolean = false,
    val isSavingFood: Boolean = false,
    val isSearchingBarcode: Boolean = false,
    val barcodeError: String? = null,
    val formState: MealFoodFormState = MealFoodFormState(),
    val editingFoodId: Int? = null,
    val error: String? = null
)

@HiltViewModel
class MealDetailViewModel @Inject constructor(
    private val mealsRepository: MealsRepository,
    private val openfoodfactsRepository: OpenfoodfactsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(MealDetailUiState())
    val uiState: StateFlow<MealDetailUiState> = _uiState.asStateFlow()

    fun loadMeal(mealId: Int) {
        _uiState.update { it.copy(mealId = mealId, isLoading = true, error = null) }
        viewModelScope.launch {
            val result = mealsRepository.getMeal(mealId)
            _uiState.update {
                it.copy(
                    isLoading = false,
                    meal = result.getOrNull(),
                    error = result.exceptionOrNull()?.message
                )
            }
        }
    }

    fun deleteMeal(onSuccess: () -> Unit) {
        val mealId = _uiState.value.mealId
        if (mealId == -1) return
        viewModelScope.launch {
            val result = mealsRepository.deleteMeal(mealId)
            if (result.isSuccess) {
                onSuccess()
            } else {
                _uiState.update { it.copy(error = result.exceptionOrNull()?.message) }
            }
        }
    }

    fun updateFormState(newState: MealFoodFormState) {
        _uiState.update { it.copy(formState = newState) }
    }

    fun startEditingFood(id: Int?) {
        if (id == null) {
            _uiState.update { it.copy(editingFoodId = null, formState = MealFoodFormState()) }
            return
        }

        val food = _uiState.value.meal?.mealFoods?.find { it.id.toInt() == id }
        if (food != null) {
            val factor = 100.0 / food.weight.toDouble()
            _uiState.update {
                it.copy(
                    editingFoodId = id,
                    formState = MealFoodFormState(
                        name = food.name,
                        weight = food.weight.toDouble().toInt().toString(),
                        calories = (food.calories.toDouble() * factor).toInt().toString(),
                        protein = (food.protein.toDouble() * factor).toInt().toString(),
                        fats = (food.fats.toDouble() * factor).toInt().toString(),
                        carbs = (food.carbs.toDouble() * factor).toInt().toString()
                    )
                )
            }
        }
    }

    fun searchBarcode(barcode: String) {
        if (barcode.isBlank()) return
        _uiState.update { it.copy(isSearchingBarcode = true, barcodeError = null) }
        viewModelScope.launch {
            val result = openfoodfactsRepository.getProduct(barcode)
            val product = result.getOrNull()
            
            if (product != null) {
                _uiState.update {
                    val form = it.formState.copy(
                        name = product.name,
                        calories = product.calories?.toDouble()?.toInt()?.toString() ?: "0",
                        protein = product.protein?.toDouble()?.toInt()?.toString() ?: "0",
                        fats = product.fats?.toDouble()?.toInt()?.toString() ?: "0",
                        carbs = product.carbs?.toDouble()?.toInt()?.toString() ?: "0"
                    )
                    it.copy(
                        isSearchingBarcode = false,
                        formState = form
                    )
                }
            } else {
                _uiState.update {
                    it.copy(
                        isSearchingBarcode = false,
                        barcodeError = "Product not found or scanning failed"
                    )
                }
            }
        }
    }

    fun saveFood(onSuccess: () -> Unit) {
        val state = _uiState.value
        val mealId = state.mealId
        if (mealId == -1 || state.formState.name.isBlank()) return

        val form = state.formState
        val weightVal = form.weight.toBigDecimalOrNull() ?: BigDecimal.ZERO
        val cals = form.calories.toBigDecimalOrNull() ?: BigDecimal.ZERO
        val prot = form.protein.toBigDecimalOrNull() ?: BigDecimal.ZERO
        val fats = form.fats.toBigDecimalOrNull() ?: BigDecimal.ZERO
        val carbs = form.carbs.toBigDecimalOrNull() ?: BigDecimal.ZERO

        _uiState.update { it.copy(isSavingFood = true, error = null) }

        viewModelScope.launch {
            val result = if (state.editingFoodId != null) {
                val dto = UpdateMealFoodDto(
                    name = form.name,
                    weight = weightVal,
                    calories = cals,
                    protein = prot,
                    fats = fats,
                    carbs = carbs
                )
                mealsRepository.updateFood(mealId, state.editingFoodId, dto)
            } else {
                val dto = CreateMealFoodDto(
                    name = form.name,
                    weight = weightVal,
                    calories = cals,
                    protein = prot,
                    fats = fats,
                    carbs = carbs
                )
                mealsRepository.addFood(mealId, dto)
            }

            _uiState.update { it.copy(isSavingFood = false) }

            if (result.isSuccess) {
                onSuccess()
                loadMeal(mealId) // Refresh list
            } else {
                _uiState.update { it.copy(error = result.exceptionOrNull()?.message) }
            }
        }
    }

    fun removeFood(foodId: Int) {
        val mealId = _uiState.value.mealId
        if (mealId == -1) return

        viewModelScope.launch {
            val result = mealsRepository.removeFood(mealId, foodId)
            if (result.isSuccess) {
                loadMeal(mealId) // Refresh
            } else {
                _uiState.update { it.copy(error = result.exceptionOrNull()?.message) }
            }
        }
    }
}
