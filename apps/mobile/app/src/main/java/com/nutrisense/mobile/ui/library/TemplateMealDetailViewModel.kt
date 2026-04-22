package com.nutrisense.mobile.ui.library

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nutrisense.mobile.data.LibraryRepository
import com.nutrisense.mobile.data.OpenfoodfactsRepository
import com.nutrisense.mobile.model.CreateTemplateMealFoodDto
import com.nutrisense.mobile.model.TemplateFoodEntity
import com.nutrisense.mobile.model.TemplateMealEntity
import com.nutrisense.mobile.model.UpdateTemplateMealFoodDto
import com.nutrisense.mobile.ui.components.FoodFormState
import com.nutrisense.mobile.ui.components.NutritionMapper
import dagger.hilt.android.lifecycle.HiltViewModel
import java.math.BigDecimal
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class TemplateMealDetailUiState(
    val templateMealId: Int = -1,
    val meal: TemplateMealEntity? = null,
    val isLoading: Boolean = false,
    val isSavingFood: Boolean = false,
    val isSearchingBarcode: Boolean = false,
    val barcodeError: String? = null,
    val formState: FoodFormState = FoodFormState(),
    val editingFoodId: Int? = null,
    val templateFoods: List<TemplateFoodEntity> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class TemplateMealDetailViewModel @Inject constructor(
    private val libraryRepository: LibraryRepository,
    private val openfoodfactsRepository: OpenfoodfactsRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow(TemplateMealDetailUiState())
    val uiState: StateFlow<TemplateMealDetailUiState> = _uiState.asStateFlow()

    fun loadMeal(templateMealId: Int) {
        _uiState.update { it.copy(templateMealId = templateMealId, isLoading = true, error = null) }
        viewModelScope.launch {
            val mealResult = libraryRepository.getTemplateMeal(templateMealId)
            val templateFoodsResult = libraryRepository.getTemplateFoods()
            _uiState.update {
                it.copy(
                    isLoading = false,
                    meal = mealResult.getOrNull(),
                    templateFoods = templateFoodsResult.getOrDefault(emptyList()),
                    error = mealResult.exceptionOrNull()?.message ?: templateFoodsResult.exceptionOrNull()?.message
                )
            }
        }
    }

    fun deleteMeal(onSuccess: () -> Unit) {
        val mealId = _uiState.value.templateMealId
        if (mealId == -1) return
        viewModelScope.launch {
            val result = libraryRepository.deleteTemplateMeal(mealId)
            if (result.isSuccess) onSuccess() else _uiState.update { it.copy(error = result.exceptionOrNull()?.message) }
        }
    }

    fun startEditingFood(id: Int?) {
        if (id == null) {
            _uiState.update { it.copy(editingFoodId = null, formState = FoodFormState()) }
            return
        }
        val food = _uiState.value.meal?.templateMealFoods?.find { it.id.toInt() == id } ?: return
        _uiState.update {
            it.copy(
                editingFoodId = id,
                formState = FoodFormState(
                    name = food.name,
                    weight = food.weight.toDouble().toInt().toString(),
                    calories = NutritionMapper.toPer100g(food.calories.toDouble(), food.weight.toDouble()).toInt().toString(),
                    protein = NutritionMapper.toPer100g(food.protein.toDouble(), food.weight.toDouble()).toInt().toString(),
                    fats = NutritionMapper.toPer100g(food.fats.toDouble(), food.weight.toDouble()).toInt().toString(),
                    carbs = NutritionMapper.toPer100g(food.carbs.toDouble(), food.weight.toDouble()).toInt().toString()
                )
            )
        }
    }

    fun updateFormState(newState: FoodFormState) {
        _uiState.update { it.copy(formState = newState) }
    }

    fun searchBarcode(barcode: String) {
        if (barcode.isBlank()) return
        _uiState.update { it.copy(isSearchingBarcode = true, barcodeError = null) }
        viewModelScope.launch {
            val result = openfoodfactsRepository.getProduct(barcode)
            val product = result.getOrNull()
            if (product != null) {
                _uiState.update {
                    it.copy(
                        isSearchingBarcode = false,
                        formState = it.formState.copy(
                            name = product.name,
                            calories = product.calories.toDouble().toInt().toString(),
                            protein = product.protein.toDouble().toInt().toString(),
                            fats = product.fats.toDouble().toInt().toString(),
                            carbs = product.carbs.toDouble().toInt().toString()
                        )
                    )
                }
            } else {
                _uiState.update { it.copy(isSearchingBarcode = false, barcodeError = "Product not found or scanning failed") }
            }
        }
    }

    fun prefillFromTemplateFood(food: TemplateFoodEntity) {
        _uiState.update {
            it.copy(
                formState = it.formState.copy(
                    name = food.name,
                    weight = "100",
                    calories = food.calories.toDouble().toInt().toString(),
                    protein = food.protein.toDouble().toInt().toString(),
                    fats = food.fats.toDouble().toInt().toString(),
                    carbs = food.carbs.toDouble().toInt().toString()
                )
            )
        }
    }

    fun saveFood(onSuccess: () -> Unit) {
        val state = _uiState.value
        val mealId = state.templateMealId
        if (mealId == -1 || state.formState.name.isBlank()) return

        val form = state.formState
        val dtoWeight = form.weight.toBigDecimalOrNull() ?: BigDecimal.ZERO
        val dtoCalories = form.calories.toBigDecimalOrNull() ?: BigDecimal.ZERO
        val dtoProtein = form.protein.toBigDecimalOrNull() ?: BigDecimal.ZERO
        val dtoFats = form.fats.toBigDecimalOrNull() ?: BigDecimal.ZERO
        val dtoCarbs = form.carbs.toBigDecimalOrNull() ?: BigDecimal.ZERO

        _uiState.update { it.copy(isSavingFood = true, error = null) }
        viewModelScope.launch {
            val result = if (state.editingFoodId != null) {
                libraryRepository.updateTemplateMealFood(
                    mealId,
                    state.editingFoodId,
                    UpdateTemplateMealFoodDto(
                        name = form.name,
                        weight = dtoWeight,
                        calories = dtoCalories,
                        protein = dtoProtein,
                        fats = dtoFats,
                        carbs = dtoCarbs
                    )
                )
            } else {
                libraryRepository.addTemplateMealFood(
                    mealId,
                    CreateTemplateMealFoodDto(
                        name = form.name,
                        weight = dtoWeight,
                        calories = dtoCalories,
                        protein = dtoProtein,
                        fats = dtoFats,
                        carbs = dtoCarbs
                    )
                )
            }

            _uiState.update { it.copy(isSavingFood = false) }
            if (result.isSuccess) {
                onSuccess()
                loadMeal(mealId)
            } else {
                _uiState.update { it.copy(error = result.exceptionOrNull()?.message) }
            }
        }
    }

    fun removeFood(foodId: Int) {
        val mealId = _uiState.value.templateMealId
        if (mealId == -1) return
        viewModelScope.launch {
            val result = libraryRepository.removeTemplateMealFood(mealId, foodId)
            if (result.isSuccess) loadMeal(mealId) else _uiState.update { it.copy(error = result.exceptionOrNull()?.message) }
        }
    }
}
