package com.nutrisense.mobile.ui.diary.meal

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nutrisense.mobile.data.IotRepository
import com.nutrisense.mobile.data.LibraryRepository
import com.nutrisense.mobile.data.MealsRepository
import com.nutrisense.mobile.data.OpenfoodfactsRepository
import com.nutrisense.mobile.data.security.PreferencesManager
import com.nutrisense.mobile.model.CreateMealFoodDto
import com.nutrisense.mobile.model.CreateTemplateFoodDto
import com.nutrisense.mobile.model.CreateTemplateMealDto
import com.nutrisense.mobile.model.MealEntity
import com.nutrisense.mobile.model.MealFoodEntity
import com.nutrisense.mobile.model.TemplateFoodEntity
import com.nutrisense.mobile.model.UpdateMealFoodDto
import com.nutrisense.mobile.ui.components.FoodFormState
import com.nutrisense.mobile.ui.components.NutritionMapper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.math.BigDecimal
import javax.inject.Inject

data class MealDetailUiState(
    val mealId: Int = -1,
    val meal: MealEntity? = null,
    val templateFoods: List<TemplateFoodEntity> = emptyList(),
    val isLoading: Boolean = false,
    val isSavingFood: Boolean = false,
    val isSavingAsTemplate: Boolean = false,
    val isFetchingScaleWeight: Boolean = false,
    val isSearchingBarcode: Boolean = false,
    val barcodeError: String? = null,
    val scaleWeightError: String? = null,
    val formState: FoodFormState = FoodFormState(),
    val editingFoodId: Int? = null,
    val error: String? = null
)

@HiltViewModel
class MealDetailViewModel @Inject constructor(
    private val mealsRepository: MealsRepository,
    private val libraryRepository: LibraryRepository,
    private val openfoodfactsRepository: OpenfoodfactsRepository,
    private val iotRepository: IotRepository,
    private val preferencesManager: PreferencesManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(MealDetailUiState())
    val uiState: StateFlow<MealDetailUiState> = _uiState.asStateFlow()

    fun loadMeal(mealId: Int) {
        _uiState.update { it.copy(mealId = mealId, isLoading = true, error = null) }
        viewModelScope.launch {
            val result = mealsRepository.getMeal(mealId)
            val templateFoodsResult = libraryRepository.getTemplateFoods()
            _uiState.update {
                it.copy(
                    isLoading = false,
                    meal = result.getOrNull(),
                    templateFoods = templateFoodsResult.getOrDefault(emptyList()),
                    error = result.exceptionOrNull()?.message ?: templateFoodsResult.exceptionOrNull()?.message
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

    fun updateFormState(newState: FoodFormState) {
        _uiState.update { it.copy(formState = newState) }
    }

    fun startEditingFood(id: Int?) {
        if (id == null) {
            _uiState.update { it.copy(editingFoodId = null, formState = FoodFormState()) }
            return
        }

        val food = _uiState.value.meal?.mealFoods?.find { it.id.toInt() == id }
        if (food != null) {
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
                        calories = product.calories.toDouble().toInt().toString(),
                        protein = product.protein.toDouble().toInt().toString(),
                        fats = product.fats.toDouble().toInt().toString(),
                        carbs = product.carbs.toDouble().toInt().toString()
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

    fun fetchScaleWeight() {
        _uiState.update { it.copy(isFetchingScaleWeight = true, scaleWeightError = null) }
        viewModelScope.launch {
            val savedSerial = preferencesManager.getIotSerial()
            if (savedSerial.isBlank()) {
                _uiState.update {
                    it.copy(
                        isFetchingScaleWeight = false,
                        scaleWeightError = "No linked scale. Link one in Settings."
                    )
                }
                return@launch
            }

            val status = iotRepository.getStatus().getOrNull()
            if (status?.isLinked != true) {
                _uiState.update {
                    it.copy(
                        isFetchingScaleWeight = false,
                        scaleWeightError = "Scale is not linked right now."
                    )
                }
                return@launch
            }

            val result = iotRepository.getCurrentWeight()
            if (result.isSuccess) {
                val weight = result.getOrNull()?.weight?.toInt() ?: 0
                _uiState.update {
                    it.copy(
                        isFetchingScaleWeight = false,
                        formState = it.formState.copy(weight = weight.toString())
                    )
                }
            } else {
                _uiState.update {
                    it.copy(
                        isFetchingScaleWeight = false,
                        scaleWeightError = result.exceptionOrNull()?.message ?: "Scale did not respond"
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

    fun saveMealAsTemplate(onSuccess: () -> Unit) {
        val meal = _uiState.value.meal ?: return
        _uiState.update { it.copy(isSavingAsTemplate = true, error = null) }
        viewModelScope.launch {
            val result = libraryRepository.createTemplateMeal(
                CreateTemplateMealDto(
                    name = meal.name,
                    templateMealFoods = meal.mealFoods.map { food ->
                        com.nutrisense.mobile.model.CreateTemplateMealFoodDto(
                            name = food.name,
                            weight = food.weight,
                            calories = NutritionMapper.toPer100g(food.calories.toDouble(), food.weight.toDouble()).toBigDecimal(),
                            protein = NutritionMapper.toPer100g(food.protein.toDouble(), food.weight.toDouble()).toBigDecimal(),
                            fats = NutritionMapper.toPer100g(food.fats.toDouble(), food.weight.toDouble()).toBigDecimal(),
                            carbs = NutritionMapper.toPer100g(food.carbs.toDouble(), food.weight.toDouble()).toBigDecimal()
                        )
                    }
                )
            )
            _uiState.update { it.copy(isSavingAsTemplate = false) }
            if (result.isSuccess) {
                onSuccess()
            } else {
                _uiState.update { it.copy(error = result.exceptionOrNull()?.message) }
            }
        }
    }

    fun saveFoodAsTemplate(food: MealFoodEntity, onSuccess: () -> Unit) {
        viewModelScope.launch {
            val result = libraryRepository.createTemplateFood(
                CreateTemplateFoodDto(
                    name = food.name,
                    calories = NutritionMapper.toPer100g(food.calories.toDouble(), food.weight.toDouble()).toBigDecimal(),
                    protein = NutritionMapper.toPer100g(food.protein.toDouble(), food.weight.toDouble()).toBigDecimal(),
                    fats = NutritionMapper.toPer100g(food.fats.toDouble(), food.weight.toDouble()).toBigDecimal(),
                    carbs = NutritionMapper.toPer100g(food.carbs.toDouble(), food.weight.toDouble()).toBigDecimal()
                )
            )
            if (result.isSuccess) {
                onSuccess()
                loadMeal(_uiState.value.mealId)
            } else {
                _uiState.update { it.copy(error = result.exceptionOrNull()?.message) }
            }
        }
    }
}
