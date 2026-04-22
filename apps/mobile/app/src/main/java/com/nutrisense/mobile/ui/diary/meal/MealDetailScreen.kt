package com.nutrisense.mobile.ui.diary.meal

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.nutrisense.mobile.ui.components.AddFoodDialog
import com.nutrisense.mobile.ui.components.FoodItemRow
import com.nutrisense.mobile.ui.components.MacroSummaryRings

@OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
@Composable
fun MealDetailScreen(
    mealId: Int,
    onNavigateBack: () -> Unit,
    onNavigateToScanner: () -> Unit = {},
    barcodeResultFlow: String? = null,
    clearBarcodeResult: () -> Unit = {},
    viewModel: MealDetailViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var showAddFoodDialog by remember { mutableStateOf(false) }
    var showDeleteMealDialog by remember { mutableStateOf(false) }
    var showSaveMealTemplateDialog by remember { mutableStateOf(false) }
    var showTemplateSavedDialog by remember { mutableStateOf(false) }
    var showEditMealDialog by remember { mutableStateOf(false) }
    var mealNameInput by remember { mutableStateOf("") }

    val lifecycleOwner = androidx.lifecycle.compose.LocalLifecycleOwner.current

    DisposableEffect(lifecycleOwner, mealId) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
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

    LaunchedEffect(barcodeResultFlow) {
        if (!barcodeResultFlow.isNullOrEmpty()) {
            showAddFoodDialog = true
            viewModel.startEditingFood(null)
            viewModel.searchBarcode(barcodeResultFlow)
            clearBarcodeResult()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = uiState.meal?.name ?: "Loading...", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { showDeleteMealDialog = true }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete Meal", tint = MaterialTheme.colorScheme.error)
                    }
                    IconButton(onClick = {
                        mealNameInput = uiState.meal?.name.orEmpty()
                        showEditMealDialog = true
                    }) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit meal")
                    }
                    IconButton(onClick = { showSaveMealTemplateDialog = true }) {
                        Icon(Icons.Default.Save, contentDescription = "Save as template")
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
                                name = food.name,
                                calories = food.calories.toDouble().toInt(),
                                weight = food.weight.toDouble().toInt(),
                                protein = food.protein.toDouble().toInt(),
                                fats = food.fats.toDouble().toInt(),
                                carbs = food.carbs.toDouble().toInt(),
                                onClick = {
                                    viewModel.startEditingFood(food.id.toInt())
                                    showAddFoodDialog = true
                                },
                                onDelete = { viewModel.removeFood(food.id.toInt()) },
                                extraTrailingContent = {
                                    IconButton(onClick = { viewModel.saveFoodAsTemplate(food) { showTemplateSavedDialog = true } }) {
                                        Icon(Icons.Default.Bookmark, contentDescription = "Save food as template")
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
    }

    if (showAddFoodDialog) {
        AddFoodDialog(
            isEditing = uiState.editingFoodId != null,
            isSavingFood = uiState.isSavingFood,
            isFetchingScaleWeight = uiState.isFetchingScaleWeight,
            formState = uiState.formState,
            isSearchingBarcode = uiState.isSearchingBarcode,
            barcodeError = uiState.barcodeError,
            scaleWeightError = uiState.scaleWeightError,
            templateFoods = uiState.templateFoods,
            onDismiss = { showAddFoodDialog = false },
            onSave = { 
                viewModel.saveFood {
                    showAddFoodDialog = false
                }
            },
            onUpdateForm = viewModel::updateFormState,
            onFetchScaleWeight = viewModel::fetchScaleWeight,
            onSearchBarcode = viewModel::searchBarcode,
            onNavigateToScanner = {
                showAddFoodDialog = false
                onNavigateToScanner()
            },
            onPrefillFromTemplateFood = viewModel::prefillFromTemplateFood
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

    if (showSaveMealTemplateDialog) {
        AlertDialog(
            onDismissRequest = { showSaveMealTemplateDialog = false },
            title = { Text("Save as Template") },
            text = { Text("Save this meal and all its foods to your library templates?") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.saveMealAsTemplate {
                            showSaveMealTemplateDialog = false
                            showTemplateSavedDialog = true
                        }
                    }
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showSaveMealTemplateDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    if (showTemplateSavedDialog) {
        AlertDialog(
            onDismissRequest = { showTemplateSavedDialog = false },
            title = { Text("Template saved") },
            text = { Text("Saved successfully to library templates.") },
            confirmButton = {
                TextButton(onClick = { showTemplateSavedDialog = false }) { Text("OK") }
            }
        )
    }

    if (showEditMealDialog) {
        AlertDialog(
            onDismissRequest = { showEditMealDialog = false },
            title = { Text("Edit Meal") },
            text = {
                androidx.compose.material3.OutlinedTextField(
                    value = mealNameInput,
                    onValueChange = { mealNameInput = it },
                    label = { Text("Meal name") },
                    singleLine = true
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.updateMealName(mealNameInput) {
                            showEditMealDialog = false
                        }
                    },
                    enabled = mealNameInput.isNotBlank()
                ) { Text("Save") }
            },
            dismissButton = {
                TextButton(onClick = { showEditMealDialog = false }) { Text("Cancel") }
            }
        )
    }
}
