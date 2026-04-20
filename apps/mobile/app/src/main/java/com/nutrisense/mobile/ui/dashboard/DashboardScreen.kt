package com.nutrisense.mobile.ui.dashboard

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material.icons.filled.WifiOff
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.nutrisense.mobile.data.DashboardData
import com.nutrisense.mobile.data.IotStatus

private const val DEFAULT_CALORIES = 2000f
private const val DEFAULT_PROTEIN  = 100f
private const val DEFAULT_FATS     = 50f
private const val DEFAULT_CARBS    = 200f

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToDiary: () -> Unit,
    onNavigateToIot: () -> Unit,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState) {
        if (uiState is DashboardUiState.Error) {
            snackbarHostState.showSnackbar((uiState as DashboardUiState.Error).message)
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        when (val state = uiState) {
            is DashboardUiState.Loading -> CircularProgressIndicator(
                modifier = Modifier.align(Alignment.Center)
            )
            is DashboardUiState.Error -> Column(
                modifier = Modifier.align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(state.message, color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium)
                Spacer(Modifier.height(16.dp))
                Button(onClick = viewModel::load) { Text("Retry") }
            }
            is DashboardUiState.Success -> PullToRefreshBox(
                isRefreshing = false,
                onRefresh = viewModel::load,
                modifier = Modifier.fillMaxSize()
            ) {
                DashboardContent(
                    data = state.data,
                    onNavigateToDiary = onNavigateToDiary,
                    onNavigateToIot = onNavigateToIot,
                    modifier = Modifier.fillMaxSize()
                )
            }
        }
        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier.align(Alignment.BottomCenter)
        )
    }
}

@Composable
private fun DashboardContent(
    data: DashboardData,
    onNavigateToDiary: () -> Unit,
    onNavigateToIot: () -> Unit,
    modifier: Modifier = Modifier
) {
    val stats = data.stats
    val actual = MacroValues(
        calories = stats?.actualCalories?.toFloat() ?: 0f,
        protein  = stats?.actualProtein?.toFloat()  ?: 0f,
        fats     = stats?.actualFats?.toFloat()     ?: 0f,
        carbs    = stats?.actualCarbs?.toFloat()    ?: 0f
    )
    val targets = MacroValues(
        calories = stats?.plan?.dayCalories?.toFloat() ?: DEFAULT_CALORIES,
        protein  = stats?.plan?.dayProtein?.toFloat()  ?: DEFAULT_PROTEIN,
        fats     = stats?.plan?.dayFats?.toFloat()     ?: DEFAULT_FATS,
        carbs    = stats?.plan?.dayCarbs?.toFloat()    ?: DEFAULT_CARBS
    )

    Column(
        modifier = modifier
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        Column(modifier = Modifier.padding(vertical = 8.dp)) {
            Text(
                text = "Good day, ${data.username} 👋",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
            Text(
                text = data.todayDate,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        // Calories card — tappable → Diary
        CaloriesCard(
            actual = actual,
            targets = targets,
            onClick = onNavigateToDiary
        )

        // Macros breakdown card — tappable → Diary
        MacrosCard(actual = actual, targets = targets, onClick = onNavigateToDiary)

        // IoT status card — tappable → Settings IoT section
        IotCard(iotStatus = data.iotStatus, onClick = onNavigateToIot)

        Spacer(Modifier.height(8.dp))
    }
}

@Composable
private fun CaloriesCard(actual: MacroValues, targets: MacroValues, onClick: () -> Unit) {
    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("DAILY CALORIES", style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                Icon(Icons.Default.ChevronRight, contentDescription = "Open diary",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Spacer(Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Text(
                    text = actual.calories.toInt().toString(),
                    style = MaterialTheme.typography.displaySmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "/ ${targets.calories.toInt()} kcal",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Spacer(Modifier.height(12.dp))
            LinearProgressIndicator(
                progress = { (actual.calories / targets.calories).coerceIn(0f, 1f) },
                modifier = Modifier.fillMaxWidth().height(10.dp),
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )
        }
    }
}

@Composable
private fun MacrosCard(actual: MacroValues, targets: MacroValues, onClick: () -> Unit) {
    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("MACRONUTRIENTS", style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                Icon(Icons.Default.ChevronRight, contentDescription = "Open diary",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            MacroRow("Protein", actual.protein, targets.protein, "g", Color(0xFF4CAF50))
            MacroRow("Fats",    actual.fats,    targets.fats,    "g", Color(0xFFFF9800))
            MacroRow("Carbs",   actual.carbs,   targets.carbs,   "g", Color(0xFF2196F3))
        }
    }
}

@Composable
private fun IotCard(iotStatus: IotStatus?, onClick: () -> Unit) {
    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier
                .padding(20.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Indicator dot
                Surface(
                    shape = CircleShape,
                    color = if (iotStatus?.isLinked == true)
                        MaterialTheme.colorScheme.primary
                    else
                        MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.size(10.dp).clip(CircleShape)
                ) {}
                Spacer(Modifier.width(12.dp))
                Column {
                    Text(
                        text = "SMART SCALE",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = if (iotStatus?.isLinked == true)
                            "Linked · ${iotStatus.serialNumber ?: ""}"
                        else
                            "Not connected",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium,
                        color = if (iotStatus?.isLinked == true)
                            MaterialTheme.colorScheme.primary
                        else
                            MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Icon(
                imageVector = if (iotStatus?.isLinked == true) Icons.Default.Wifi else Icons.Default.WifiOff,
                contentDescription = null,
                tint = if (iotStatus?.isLinked == true)
                    MaterialTheme.colorScheme.primary
                else
                    MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun MacroRow(label: String, actual: Float, target: Float, unit: String, color: Color) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(label, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
            Text("${actual.toInt()} / ${target.toInt()} $unit",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        LinearProgressIndicator(
            progress = { (actual / target).coerceIn(0f, 1f) },
            modifier = Modifier.fillMaxWidth().height(6.dp),
            color = color,
            trackColor = MaterialTheme.colorScheme.surfaceVariant
        )
    }
}

private data class MacroValues(val calories: Float, val protein: Float, val fats: Float, val carbs: Float)
