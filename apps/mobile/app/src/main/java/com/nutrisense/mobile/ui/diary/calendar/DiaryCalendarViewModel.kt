package com.nutrisense.mobile.ui.diary.calendar

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nutrisense.mobile.data.StatsRepository
import com.nutrisense.mobile.model.DailyStatsEntity
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import javax.inject.Inject

data class DiaryCalendarUiState(
    val currentDate: LocalDate = LocalDate.now(),
    val stats: List<DailyStatsEntity> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class DiaryCalendarViewModel @Inject constructor(
    private val statsRepository: StatsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(DiaryCalendarUiState())
    val uiState: StateFlow<DiaryCalendarUiState> = _uiState.asStateFlow()

    init {
        loadStatsForCurrentMonth()
    }

    fun nextMonth() {
        _uiState.update { it.copy(currentDate = it.currentDate.plusMonths(1)) }
        loadStatsForCurrentMonth()
    }

    fun prevMonth() {
        _uiState.update { it.copy(currentDate = it.currentDate.minusMonths(1)) }
        loadStatsForCurrentMonth()
    }

    fun refresh() {
        loadStatsForCurrentMonth()
    }

    private fun loadStatsForCurrentMonth() {
        val date = _uiState.value.currentDate
        val month = YearMonth.from(date)
        val startDate = month.atDay(1).format(DateTimeFormatter.ISO_LOCAL_DATE)
        val endDate = month.atEndOfMonth().format(DateTimeFormatter.ISO_LOCAL_DATE)

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val result = statsRepository.getStats(startDate, endDate)
            if (result.isSuccess) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        stats = result.getOrNull() ?: emptyList()
                    )
                }
            } else {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = result.exceptionOrNull()?.message ?: "Unknown error"
                    )
                }
            }
        }
    }
}
