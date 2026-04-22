package com.nutrisense.mobile.ui.diary.date

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nutrisense.mobile.data.LibraryRepository
import com.nutrisense.mobile.data.MealsRepository
import com.nutrisense.mobile.data.PlansRepository
import com.nutrisense.mobile.model.CreateMealDto
import com.nutrisense.mobile.model.CreateMealFoodDto
import com.nutrisense.mobile.model.MealEntity
import com.nutrisense.mobile.model.PlanEntity
import com.nutrisense.mobile.model.TemplateMealEntity
import com.nutrisense.mobile.ui.components.NutritionMapper
import dagger.hilt.android.lifecycle.HiltViewModel
import java.math.BigDecimal
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DiaryDateUiState(
    val date: String = "",
    val meals: List<MealEntity> = emptyList(),
    val templateMeals: List<TemplateMealEntity> = emptyList(),
    val plan: PlanEntity? = null,
    val isLoading: Boolean = false,
    val isCreatingMeal: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class DiaryDateViewModel @Inject constructor(
    private val mealsRepository: MealsRepository,
    private val plansRepository: PlansRepository,
    private val libraryRepository: LibraryRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(DiaryDateUiState())
    val uiState: StateFlow<DiaryDateUiState> = _uiState.asStateFlow()

    fun loadData(date: String) {
        _uiState.update { it.copy(date = date, isLoading = true, error = null) }
        viewModelScope.launch {
            val mealsResult = mealsRepository.getMeals(date, date)
            val planResult = plansRepository.getPlanByDate(date)
            val templateMealsResult = libraryRepository.getTemplateMeals()

            _uiState.update {
                it.copy(
                    isLoading = false,
                    meals = mealsResult.getOrNull() ?: emptyList(),
                    templateMeals = templateMealsResult.getOrNull() ?: emptyList(),
                    plan = planResult.getOrNull(),
                    error = mealsResult.exceptionOrNull()?.message
                        ?: planResult.exceptionOrNull()?.message
                        ?: templateMealsResult.exceptionOrNull()?.message
                )
            }
        }
    }

    fun createMeal(name: String, onSuccess: (Int) -> Unit) {
        val date = _uiState.value.date
        if (date.isEmpty() || name.isBlank()) return

        _uiState.update { it.copy(isCreatingMeal = true, error = null) }
        viewModelScope.launch {
            val createDto = CreateMealDto(name = name, date = date, mealFoods = emptyList())
            val result = mealsRepository.createMeal(createDto)
            
            _uiState.update { it.copy(isCreatingMeal = false) }
            
            if (result.isSuccess) {
                val mealId = result.getOrNull()?.id?.toInt()
                if (mealId != null) {
                    onSuccess(mealId)
                } else {
                    loadData(date)
                }
            } else {
                _uiState.update { it.copy(error = result.exceptionOrNull()?.message) }
            }
        }
    }

    fun refresh() {
        val date = _uiState.value.date
        if (date.isNotEmpty()) {
            loadData(date)
        }
    }

    fun createMealFromTemplate(template: TemplateMealEntity, onSuccess: (Int) -> Unit) {
        val date = _uiState.value.date
        if (date.isBlank()) return
        _uiState.update { it.copy(isCreatingMeal = true, error = null) }
        viewModelScope.launch {
            val createDto = CreateMealDto(
                name = template.name,
                date = date,
                mealFoods = template.templateMealFoods.map { food ->
                    CreateMealFoodDto(
                        name = food.name,
                        weight = food.weight,
                        calories = NutritionMapper.toPer100g(food.calories.toDouble(), food.weight.toDouble()).toBigDecimal(),
                        protein = NutritionMapper.toPer100g(food.protein.toDouble(), food.weight.toDouble()).toBigDecimal(),
                        fats = NutritionMapper.toPer100g(food.fats.toDouble(), food.weight.toDouble()).toBigDecimal(),
                        carbs = NutritionMapper.toPer100g(food.carbs.toDouble(), food.weight.toDouble()).toBigDecimal()
                    )
                }
            )
            val result = mealsRepository.createMeal(createDto)
            _uiState.update { it.copy(isCreatingMeal = false) }
            if (result.isSuccess) {
                val mealId = result.getOrNull()?.id?.toInt()
                if (mealId != null) onSuccess(mealId) else loadData(date)
            } else {
                _uiState.update { it.copy(error = result.exceptionOrNull()?.message) }
            }
        }
    }
}
