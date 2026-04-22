package com.nutrisense.mobile.ui.diary.calendar

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale

@Composable
fun DiaryCalendarScreen(
    onNavigateToDate: (String) -> Unit,
    viewModel: DiaryCalendarViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val lifecycleOwner = androidx.lifecycle.compose.LocalLifecycleOwner.current

    androidx.compose.runtime.DisposableEffect(lifecycleOwner) {
        val observer = androidx.lifecycle.LifecycleEventObserver { _, event ->
            if (event == androidx.lifecycle.Lifecycle.Event.ON_RESUME) {
                viewModel.refresh()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        MonthSummaryBanner(uiState)
        
        if (uiState.error != null) {
            Spacer(modifier = Modifier.height(16.dp))
            val isTimeout = uiState.error!!.contains("timeout", ignoreCase = true)
            val displayMsg = if (isTimeout) {
                "The backend service is waking up.\nThis may take 30-60 seconds because it's on a free server."
            } else {
                uiState.error!!
            }
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = displayMsg,
                        color = MaterialTheme.colorScheme.onErrorContainer,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.weight(1f)
                    )
                    TextButton(onClick = viewModel::refresh) {
                        Text("RETRY", color = MaterialTheme.colorScheme.onErrorContainer)
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        CalendarHeader(
            currentDate = uiState.currentDate,
            onPrevClick = { viewModel.prevMonth() },
            onNextClick = { viewModel.nextMonth() }
        )
        Spacer(modifier = Modifier.height(16.dp))
        CalendarGrid(
            modifier = Modifier.weight(1f),
            uiState = uiState,
            onDateClick = { date ->
                onNavigateToDate(date.format(DateTimeFormatter.ISO_LOCAL_DATE))
            }
        )
    }
}

@Composable
private fun MonthSummaryBanner(uiState: DiaryCalendarUiState) {
    var cals = 0.0
    var prot = 0.0
    var fat = 0.0
    var carb = 0.0
    var daysWithData = 0

    uiState.stats.forEach { stat ->
        if (stat.actualCalories > 0.toBigDecimal()) {
            daysWithData++
            cals += stat.actualCalories.toDouble()
            prot += stat.actualProtein.toDouble()
            fat += stat.actualFats.toDouble()
            carb += stat.actualCarbs.toDouble()
        }
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "MONTH SUMMARY",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = "BASED ON $daysWithData LOGGED DAYS",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.primary
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                SummaryItem(label = "TOTAL KCAL", value = cals.toInt().toString())
                SummaryItem(
                    label = "AVG KCAL/DAY",
                    value = if (daysWithData > 0) (cals / daysWithData).toInt().toString() else "0"
                )
                SummaryItem(
                    label = "AVG MACROS",
                    value = if (daysWithData > 0) {
                        "P:${(prot / daysWithData).toInt()} F:${(fat / daysWithData).toInt()} C:${(carb / daysWithData).toInt()}"
                    } else {
                        "P:0 F:0 C:0"
                    },
                    isPrimary = true
                )
            }
        }
    }
}

@Composable
private fun SummaryItem(label: String, value: String, isPrimary: Boolean = false) {
    Column {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
        )
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = if (isPrimary) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun CalendarHeader(
    currentDate: LocalDate,
    onPrevClick: () -> Unit,
    onNextClick: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                text = "DAILY LOG",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
            Text(
                text = "CALENDAR OVERVIEW",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
            )
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "${currentDate.month.getDisplayName(TextStyle.FULL, Locale.getDefault())} ${currentDate.year}",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(end = 8.dp)
            )
            IconButton(onClick = onPrevClick) {
                Icon(Icons.Default.ChevronLeft, contentDescription = "Previous Month")
            }
            IconButton(onClick = onNextClick) {
                Icon(Icons.Default.ChevronRight, contentDescription = "Next Month")
            }
        }
    }
}

@Composable
private fun CalendarGrid(
    modifier: Modifier = Modifier,
    uiState: DiaryCalendarUiState,
    onDateClick: (LocalDate) -> Unit
) {
    val yearMonth = YearMonth.from(uiState.currentDate)
    val daysInMonth = yearMonth.lengthOfMonth()
    val firstDayOfWeek = yearMonth.atDay(1).dayOfWeek.value % 7 // Sunday = 0

    val days = listOf("SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT")
    val dayCellsCount = firstDayOfWeek + daysInMonth
    val rows = kotlin.math.ceil(dayCellsCount / 7.0).toInt().coerceAtLeast(1)
    val rowSpacing = 6.dp
    val headerHeight = 22.dp
    val contentTopSpacing = 8.dp
    val fixedVertical = headerHeight + contentTopSpacing + rowSpacing * (rows - 1)

    BoxWithConstraints(modifier = modifier.fillMaxSize()) {
        val cellHeight = ((maxHeight - fixedVertical) / rows).coerceAtLeast(56.dp)

        Column(modifier = Modifier.fillMaxSize()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(headerHeight),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                days.forEach { day ->
                    Box(
                        modifier = Modifier.weight(1f),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = day,
                            textAlign = TextAlign.Center,
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(contentTopSpacing))

            LazyVerticalGrid(
                columns = GridCells.Fixed(7),
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalArrangement = Arrangement.spacedBy(rowSpacing),
                userScrollEnabled = false,
                modifier = Modifier.fillMaxSize()
            ) {
                // Empty padding cells
                items(firstDayOfWeek) {
                    Box(modifier = Modifier.height(cellHeight))
                }

                // Day cells
                items(daysInMonth) { index ->
                    val date = yearMonth.atDay(index + 1)
                    val dateStr = date.format(DateTimeFormatter.ISO_LOCAL_DATE)
                    val stat = uiState.stats.find { it.date == dateStr }
                    val today = LocalDate.now()
                    val isToday = date == today
                    val isFuture = date.isAfter(today)
                    val actualCalories = stat?.actualCalories?.toInt() ?: 0
                    val plannedCalories = stat?.plan?.dayCalories?.toInt()
                    val hasPlan = plannedCalories != null
                    val isNearPlan = hasPlan && kotlin.math.abs(actualCalories - plannedCalories!!) <= 100

                    val stateBorderColor = when {
                        isFuture -> MaterialTheme.colorScheme.outline
                        isNearPlan -> MaterialTheme.colorScheme.primary
                        hasPlan -> MaterialTheme.colorScheme.error
                        else -> MaterialTheme.colorScheme.outline
                    }
                    val stateTextColor = when {
                        isFuture -> MaterialTheme.colorScheme.onSurfaceVariant
                        isNearPlan -> MaterialTheme.colorScheme.primary
                        hasPlan -> MaterialTheme.colorScheme.error
                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                    }
                    val caloriesText = if (isFuture) {
                        if (hasPlan) "- / ${plannedCalories}" else "- / -"
                    } else {
                        "${if (actualCalories > 0) actualCalories else "-"} / ${plannedCalories?.toString() ?: "-"}"
                    }

                    Box(
                        modifier = Modifier
                            .height(cellHeight)
                            .clip(RoundedCornerShape(8.dp))
                            .background(MaterialTheme.colorScheme.surface)
                            .border(
                                width = if (isToday) 2.dp else 1.dp,
                                color = if (isToday) MaterialTheme.colorScheme.onBackground else stateBorderColor,
                                shape = RoundedCornerShape(8.dp)
                            )
                            .clickable { onDateClick(date) }
                            .padding(6.dp)
                    ) {
                        Column(
                            modifier = Modifier.fillMaxSize(),
                            verticalArrangement = Arrangement.SpaceBetween,
                            horizontalAlignment = Alignment.Start
                        ) {
                            Text(
                                text = date.dayOfMonth.toString(),
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.Bold,
                                color = if (isToday) MaterialTheme.colorScheme.onBackground else MaterialTheme.colorScheme.onSurface
                            )

                            Text(
                                text = caloriesText,
                                style = MaterialTheme.typography.labelSmall,
                                color = stateTextColor,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }
        }
    }
}
