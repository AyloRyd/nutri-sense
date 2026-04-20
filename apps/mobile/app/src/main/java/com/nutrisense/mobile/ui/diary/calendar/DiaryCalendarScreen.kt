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
                    value = "P:${(prot).toInt()} F:${(fat).toInt()} C:${(carb).toInt()}",
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
    uiState: DiaryCalendarUiState,
    onDateClick: (LocalDate) -> Unit
) {
    val yearMonth = YearMonth.from(uiState.currentDate)
    val daysInMonth = yearMonth.lengthOfMonth()
    val firstDayOfWeek = yearMonth.atDay(1).dayOfWeek.value % 7 // Sunday = 0

    val days = listOf("SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT")

    LazyVerticalGrid(
        columns = GridCells.Fixed(7),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        // Headers
        items(days) { day ->
            Text(
                text = day,
                textAlign = TextAlign.Center,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(bottom = 8.dp)
            )
        }

        // Empty padding cells
        items(firstDayOfWeek) {
            Box(modifier = Modifier.aspectRatio(1f))
        }

        // Day cells
        items(daysInMonth) { index ->
            val date = yearMonth.atDay(index + 1)
            val dateStr = date.format(DateTimeFormatter.ISO_LOCAL_DATE)
            val stat = uiState.stats.find { it.date == dateStr }
            val isToday = date == LocalDate.now()

            val backgroundColor = when {
                stat == null -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                stat.actualCalories.toDouble() == 0.0 -> MaterialTheme.colorScheme.errorContainer
                stat.plan != null && Math.abs(stat.actualCalories.toDouble() - stat.plan!!.dayCalories.toDouble()) <= 100 -> MaterialTheme.colorScheme.primaryContainer
                else -> MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.5f)
            }

            val contentColor = when {
                stat == null -> MaterialTheme.colorScheme.onSurfaceVariant
                stat.actualCalories.toDouble() == 0.0 -> MaterialTheme.colorScheme.onErrorContainer
                stat.plan != null && Math.abs(stat.actualCalories.toDouble() - stat.plan!!.dayCalories.toDouble()) <= 100 -> MaterialTheme.colorScheme.onPrimaryContainer
                else -> MaterialTheme.colorScheme.onErrorContainer
            }

            Box(
                modifier = Modifier
                    .aspectRatio(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(backgroundColor)
                    .border(
                        width = if (isToday) 2.dp else 0.dp,
                        color = if (isToday) MaterialTheme.colorScheme.onBackground else Color.Transparent,
                        shape = RoundedCornerShape(8.dp)
                    )
                    .clickable { onDateClick(date) }
                    .padding(4.dp)
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
                        color = if (isToday) MaterialTheme.colorScheme.background else contentColor,
                        modifier = Modifier
                            .background(
                                color = if (isToday) MaterialTheme.colorScheme.onBackground else Color.Transparent,
                                shape = RoundedCornerShape(4.dp)
                            )
                            .padding(horizontal = 4.dp, vertical = 2.dp)
                    )
                    
                    if (stat != null && stat.actualCalories.toDouble() > 0) {
                        Text(
                            text = stat.actualCalories.toInt().toString(),
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = contentColor
                        )
                    }
                }
            }
        }
    }
}
