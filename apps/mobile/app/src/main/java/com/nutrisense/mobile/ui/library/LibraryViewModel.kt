package com.nutrisense.mobile.ui.library

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nutrisense.mobile.data.LibraryRepository
import com.nutrisense.mobile.model.CreateTemplateFoodDto
import com.nutrisense.mobile.model.CreateTemplateMealDto
import com.nutrisense.mobile.model.TemplateFoodEntity
import com.nutrisense.mobile.model.TemplateMealEntity
import com.nutrisense.mobile.model.UpdateTemplateFoodDto
import com.nutrisense.mobile.model.UpdateTemplateMealDto
import dagger.hilt.android.lifecycle.HiltViewModel
import java.math.BigDecimal
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class LibraryUiState(
    val templateMeals: List<TemplateMealEntity> = emptyList(),
    val templateFoods: List<TemplateFoodEntity> = emptyList(),
    val isLoading: Boolean = false,
    val isSaving: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class LibraryViewModel @Inject constructor(
    private val libraryRepository: LibraryRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow(LibraryUiState())
    val uiState: StateFlow<LibraryUiState> = _uiState.asStateFlow()

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            val mealsResult = libraryRepository.getTemplateMeals()
            val foodsResult = libraryRepository.getTemplateFoods()
            _uiState.update {
                it.copy(
                    isLoading = false,
                    templateMeals = mealsResult.getOrDefault(emptyList()),
                    templateFoods = foodsResult.getOrDefault(emptyList()),
                    error = mealsResult.exceptionOrNull()?.message ?: foodsResult.exceptionOrNull()?.message
                )
            }
        }
    }

    fun createTemplateMeal(name: String, onCreated: (Int) -> Unit) {
        if (name.isBlank()) return
        _uiState.update { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            val result = libraryRepository.createTemplateMeal(
                CreateTemplateMealDto(name = name, templateMealFoods = emptyList())
            )
            _uiState.update { it.copy(isSaving = false) }
            if (result.isSuccess) {
                load()
                result.getOrNull()?.id?.toInt()?.let(onCreated)
            } else {
                _uiState.update { it.copy(error = result.exceptionOrNull()?.message) }
            }
        }
    }

    fun renameTemplateMeal(id: Int, name: String) {
        if (name.isBlank()) return
        viewModelScope.launch {
            val result = libraryRepository.updateTemplateMeal(
                id,
                UpdateTemplateMealDto(name = name)
            )
            if (result.isSuccess) load() else _uiState.update { it.copy(error = result.exceptionOrNull()?.message) }
        }
    }

    fun deleteTemplateMeal(id: Int) {
        viewModelScope.launch {
            val result = libraryRepository.deleteTemplateMeal(id)
            if (result.isSuccess) load() else _uiState.update { it.copy(error = result.exceptionOrNull()?.message) }
        }
    }

    fun createTemplateFood(
        name: String,
        calories: String,
        protein: String,
        fats: String,
        carbs: String
    ) {
        if (name.isBlank()) return
        val dto = CreateTemplateFoodDto(
            name = name,
            calories = calories.toBigDecimalOrNull() ?: BigDecimal.ZERO,
            protein = protein.toBigDecimalOrNull() ?: BigDecimal.ZERO,
            fats = fats.toBigDecimalOrNull() ?: BigDecimal.ZERO,
            carbs = carbs.toBigDecimalOrNull() ?: BigDecimal.ZERO
        )
        viewModelScope.launch {
            val result = libraryRepository.createTemplateFood(dto)
            if (result.isSuccess) load() else _uiState.update { it.copy(error = result.exceptionOrNull()?.message) }
        }
    }

    fun updateTemplateFood(
        id: Int,
        name: String,
        calories: String,
        protein: String,
        fats: String,
        carbs: String
    ) {
        if (name.isBlank()) return
        val dto = UpdateTemplateFoodDto(
            name = name,
            calories = calories.toBigDecimalOrNull() ?: BigDecimal.ZERO,
            protein = protein.toBigDecimalOrNull() ?: BigDecimal.ZERO,
            fats = fats.toBigDecimalOrNull() ?: BigDecimal.ZERO,
            carbs = carbs.toBigDecimalOrNull() ?: BigDecimal.ZERO
        )
        viewModelScope.launch {
            val result = libraryRepository.updateTemplateFood(id, dto)
            if (result.isSuccess) load() else _uiState.update { it.copy(error = result.exceptionOrNull()?.message) }
        }
    }

    fun deleteTemplateFood(id: Int) {
        viewModelScope.launch {
            val result = libraryRepository.deleteTemplateFood(id)
            if (result.isSuccess) load() else _uiState.update { it.copy(error = result.exceptionOrNull()?.message) }
        }
    }
}
