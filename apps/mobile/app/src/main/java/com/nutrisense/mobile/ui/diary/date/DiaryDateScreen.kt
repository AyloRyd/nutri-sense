package com.nutrisense.mobile.ui.diary.date

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.nutrisense.mobile.model.MealEntity

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiaryDateScreen(
    date: String,
    onNavigateBack: () -> Unit,
    onNavigateToMeal: (Int) -> Unit,
    viewModel: DiaryDateViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var showCreateDialog by remember { mutableStateOf(false) }

    val lifecycleOwner = androidx.lifecycle.compose.LocalLifecycleOwner.current

    androidx.compose.runtime.DisposableEffect(lifecycleOwner, date) {
        val observer = androidx.lifecycle.LifecycleEventObserver { _, event ->
            if (event == androidx.lifecycle.Lifecycle.Event.ON_RESUME) {
                viewModel.loadData(date)
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = "LOG $date", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                    titleContentColor = MaterialTheme.colorScheme.onBackground
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showCreateDialog = true },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Meal")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp)
        ) {
            NutritionSummary(uiState)
            
            Spacer(modifier = Modifier.height(16.dp))

            if (uiState.isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else if (uiState.error != null) {
                val isTimeout = uiState.error!!.contains("timeout", ignoreCase = true)
                val displayMsg = if (isTimeout) {
                    "The backend service is waking up.\nThis may take 30-60 seconds because it's on a free server.\nPlease try again."
                } else {
                    uiState.error!!
                }
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = displayMsg,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        modifier = Modifier.padding(32.dp)
                    )
                    Spacer(Modifier.height(16.dp))
                    Button(onClick = viewModel::refresh) { Text("Retry Connection") }
                }
            } else if (uiState.meals.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No meals logged yet", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(uiState.meals, key = { it.id.toInt() }) { meal ->
                        MealCard(meal = meal, onClick = { onNavigateToMeal(meal.id.toInt()) })
                    }
                }
            }
        }
    }

    if (showCreateDialog) {
        CreateMealDialog(
            onDismiss = { showCreateDialog = false },
            onCreate = { name ->
                viewModel.createMeal(name) { newMealId ->
                    showCreateDialog = false
                    onNavigateToMeal(newMealId)
                }
            },
            isCreating = uiState.isCreatingMeal
        )
    }
}

@Composable
private fun NutritionSummary(uiState: DiaryDateUiState) {
    val totalCals = uiState.meals.sumOf { it.calories.toDouble() }
    val totalProt = uiState.meals.sumOf { it.protein.toDouble() }
    val totalFats = uiState.meals.sumOf { it.fats.toDouble() }
    val totalCarbs = uiState.meals.sumOf { it.carbs.toDouble() }

    val goalCals = uiState.plan?.dayCalories?.toDouble() ?: 0.0
    val goalProt = uiState.plan?.dayProtein?.toDouble() ?: 100.0 // Defaults to prevent div by zero
    val goalFats = uiState.plan?.dayFats?.toDouble() ?: 50.0
    val goalCarbs = uiState.plan?.dayCarbs?.toDouble() ?: 200.0

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Top: Calories
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Column {
                    Text("TOTAL CALORIES", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(
                        "${totalCals.toInt()} / ${if (goalCals > 0) goalCals.toInt() else "-"}",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Bottom: Macro Rings
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                MacroRing(
                    label = "Protein",
                    value = totalProt.toFloat(),
                    target = goalProt.toFloat(),
                    color = androidx.compose.ui.graphics.Color(0xFF4CAF50)
                )
                MacroRing(
                    label = "Fats",
                    value = totalFats.toFloat(),
                    target = goalFats.toFloat(),
                    color = androidx.compose.ui.graphics.Color(0xFFFF9800)
                )
                MacroRing(
                    label = "Carbs",
                    value = totalCarbs.toFloat(),
                    target = goalCarbs.toFloat(),
                    color = androidx.compose.ui.graphics.Color(0xFF2196F3)
                )
            }
        }
    }
}

@Composable
private fun MacroRing(
    label: String,
    value: Float,
    target: Float,
    color: androidx.compose.ui.graphics.Color,
    modifier: Modifier = Modifier
) {
    val progress = if (target > 0f) (value / target).coerceIn(0f, 1f) else 0f
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = modifier) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.size(80.dp)
        ) {
            CircularProgressIndicator(
                progress = { progress },
                modifier = Modifier.fillMaxSize(),
                color = color,
                trackColor = androidx.compose.ui.graphics.Color(0xFF2A2A2A),
                strokeWidth = 6.dp,
                strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            )
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "${value.toInt()}g",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                HorizontalDivider(
                    modifier = Modifier.width(24.dp).padding(vertical = 2.dp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f)
                )
                Text(
                    text = "${target.toInt()}g",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                )
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun MealCard(meal: MealEntity, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = meal.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${meal.calories.toInt()} KCAL",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("P: ${meal.protein.toInt()}g", style = MaterialTheme.typography.labelSmall)
                Text("F: ${meal.fats.toInt()}g", style = MaterialTheme.typography.labelSmall)
                Text("C: ${meal.carbs.toInt()}g", style = MaterialTheme.typography.labelSmall)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CreateMealDialog(
    onDismiss: () -> Unit,
    onCreate: (String) -> Unit,
    isCreating: Boolean
) {
    var mealName by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("INIT NEW MEAL") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = mealName,
                    onValueChange = { mealName = it },
                    label = { Text("Meal name") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Text(
                    "Hint: In the future, you will be able to select a template here.",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onCreate(mealName) },
                enabled = mealName.isNotBlank() && !isCreating
            ) {
                if (isCreating) CircularProgressIndicator(modifier = Modifier.size(24.dp))
                else Text("ADD MEAL")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("CANCEL")
            }
        }
    )
}
