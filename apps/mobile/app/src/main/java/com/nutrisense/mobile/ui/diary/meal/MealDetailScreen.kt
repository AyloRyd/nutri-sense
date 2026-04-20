package com.nutrisense.mobile.ui.diary.meal

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.nutrisense.mobile.model.MealFoodEntity

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MealDetailScreen(
    mealId: Int,
    onNavigateBack: () -> Unit,
    viewModel: MealDetailViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var showAddFoodDialog by remember { mutableStateOf(false) }
    var showDeleteMealDialog by remember { mutableStateOf(false) }

    val lifecycleOwner = androidx.lifecycle.compose.LocalLifecycleOwner.current

    androidx.compose.runtime.DisposableEffect(lifecycleOwner, mealId) {
        val observer = androidx.lifecycle.LifecycleEventObserver { _, event ->
            if (event == androidx.lifecycle.Lifecycle.Event.ON_RESUME) {
                viewModel.loadMeal(mealId)
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    if (uiState.isLoading && uiState.meal == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = uiState.meal?.name ?: "Loading...", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { showDeleteMealDialog = true }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete Meal", tint = MaterialTheme.colorScheme.error)
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
                onClick = { 
                    viewModel.startEditingFood(null)
                    showAddFoodDialog = true 
                },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Food")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp)
        ) {
            uiState.meal?.let { meal ->
                MacroSummaryRings(
                    calories = meal.calories.toDouble().toInt(),
                    protein = meal.protein.toDouble().toInt(),
                    fats = meal.fats.toDouble().toInt(),
                    carbs = meal.carbs.toDouble().toInt()
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                if (meal.mealFoods.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No foods added yet", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        contentPadding = PaddingValues(bottom = 80.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(meal.mealFoods, key = { it.id.toInt() }) { food ->
                            FoodItemRow(
                                food = food,
                                onClick = {
                                    viewModel.startEditingFood(food.id.toInt())
                                    showAddFoodDialog = true
                                },
                                onDelete = { viewModel.removeFood(food.id.toInt()) }
                            )
                        }
                    }
                }
            }
        }
    }

    if (showAddFoodDialog) {
        AddFoodDialog(
            uiState = uiState,
            onDismiss = { showAddFoodDialog = false },
            onSave = { 
                viewModel.saveFood {
                    showAddFoodDialog = false
                }
            },
            onUpdateForm = viewModel::updateFormState,
            onSearchBarcode = viewModel::searchBarcode
        )
    }

    if (showDeleteMealDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteMealDialog = false },
            title = { Text("Delete Meal") },
            text = { Text("Are you sure you want to delete this meal?") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteMeal {
                            showDeleteMealDialog = false
                            onNavigateBack()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteMealDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun MacroSummaryRings(calories: Int, protein: Int, fats: Int, carbs: Int) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text("TOTAL KCAL", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(
                text = calories.toString(),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("PROTEIN", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("${protein}g", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("FATS", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("${fats}g", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("CARBS", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("${carbs}g", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun FoodItemRow(food: MealFoodEntity, onClick: () -> Unit, onDelete: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = food.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${food.calories.toDouble().toInt()} KCAL",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("W: ${food.weight.toDouble().toInt()}g", style = MaterialTheme.typography.labelSmall)
                    Text("P: ${food.protein.toDouble().toInt()}g", style = MaterialTheme.typography.labelSmall)
                    Text("F: ${food.fats.toDouble().toInt()}g", style = MaterialTheme.typography.labelSmall)
                    Text("C: ${food.carbs.toDouble().toInt()}g", style = MaterialTheme.typography.labelSmall)
                }
            }
            IconButton(onClick = onDelete) {
                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddFoodDialog(
    uiState: MealDetailUiState,
    onDismiss: () -> Unit,
    onSave: () -> Unit,
    onUpdateForm: (MealFoodFormState) -> Unit,
    onSearchBarcode: (String) -> Unit
) {
    var selectedTab by remember { mutableStateOf(0) }
    val isEditing = uiState.editingFoodId != null

    AlertDialog(
        onDismissRequest = onDismiss,
        properties = androidx.compose.ui.window.DialogProperties(usePlatformDefaultWidth = false),
        modifier = Modifier
            .fillMaxWidth(0.95f)
            .clip(RoundedCornerShape(16.dp))
            .background(MaterialTheme.colorScheme.surface),
        title = null,
        text = {
            Column {
                Text(
                    text = if (isEditing) "EDIT FOOD" else "ADD FOOD",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                if (!isEditing) {
                    TabRow(selectedTabIndex = selectedTab) {
                        Tab(
                            selected = selectedTab == 0,
                            onClick = { selectedTab = 0 },
                            text = { Text("Manual") }
                        )
                        Tab(
                            selected = selectedTab == 1,
                            onClick = { selectedTab = 1 },
                            text = { Text("Barcode") }
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                if (selectedTab == 1 && !isEditing) {
                    var barcodeInput by remember { mutableStateOf("") }
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        OutlinedTextField(
                            value = barcodeInput,
                            onValueChange = { barcodeInput = it },
                            label = { Text("Barcode") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        IconButton(
                            onClick = { onSearchBarcode(barcodeInput) },
                            modifier = Modifier.background(MaterialTheme.colorScheme.primaryContainer, RoundedCornerShape(8.dp))
                        ) {
                            if (uiState.isSearchingBarcode) {
                                CircularProgressIndicator(modifier = Modifier.size(24.dp))
                            } else {
                                Icon(Icons.Default.Search, contentDescription = "Search", tint = MaterialTheme.colorScheme.onPrimaryContainer)
                            }
                        }
                    }
                    if (uiState.barcodeError != null) {
                        Text(uiState.barcodeError, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                val form = uiState.formState
                OutlinedTextField(
                    value = form.name,
                    onValueChange = { onUpdateForm(form.copy(name = it)) },
                    label = { Text("Food name") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = form.weight,
                        onValueChange = { onUpdateForm(form.copy(weight = it)) },
                        label = { Text("Weight (g)") },
                        modifier = Modifier.weight(1f),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                    OutlinedTextField(
                        value = form.calories,
                        onValueChange = { onUpdateForm(form.copy(calories = it)) },
                        label = { Text("Calories") },
                        modifier = Modifier.weight(1f),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = form.protein,
                        onValueChange = { onUpdateForm(form.copy(protein = it)) },
                        label = { Text("Protein") },
                        modifier = Modifier.weight(1f),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                    OutlinedTextField(
                        value = form.fats,
                        onValueChange = { onUpdateForm(form.copy(fats = it)) },
                        label = { Text("Fats") },
                        modifier = Modifier.weight(1f),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                    OutlinedTextField(
                        value = form.carbs,
                        onValueChange = { onUpdateForm(form.copy(carbs = it)) },
                        label = { Text("Carbs") },
                        modifier = Modifier.weight(1f),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onSave,
                enabled = uiState.formState.name.isNotBlank() && !uiState.isSavingFood
            ) {
                if (uiState.isSavingFood) CircularProgressIndicator(modifier = Modifier.size(24.dp))
                else Text(if (isEditing) "SAVE" else "ADD")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("CANCEL")
            }
        }
    )
}
