package com.nutrisense.mobile.ui.library

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
import androidx.compose.material.icons.filled.Delete
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
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.nutrisense.mobile.ui.components.AddFoodDialog
import com.nutrisense.mobile.ui.components.FoodItemRow
import com.nutrisense.mobile.ui.components.MacroSummaryRings

@OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
@Composable
fun TemplateMealDetailScreen(
    templateMealId: Int,
    onNavigateBack: () -> Unit,
    onNavigateToScanner: () -> Unit = {},
    barcodeResultFlow: String? = null,
    clearBarcodeResult: () -> Unit = {},
    viewModel: TemplateMealDetailViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var showAddFoodDialog by remember { mutableStateOf(false) }
    var showDeleteMealDialog by remember { mutableStateOf(false) }
    val lifecycleOwner = LocalLifecycleOwner.current

    DisposableEffect(lifecycleOwner, templateMealId) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                viewModel.loadMeal(templateMealId)
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    LaunchedEffect(barcodeResultFlow) {
        if (!barcodeResultFlow.isNullOrEmpty()) {
            showAddFoodDialog = true
            viewModel.startEditingFood(null)
            viewModel.searchBarcode(barcodeResultFlow)
            clearBarcodeResult()
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
                title = {
                    Column {
                        Text(uiState.meal?.name ?: "Loading...", fontWeight = FontWeight.Bold)
                        Text("Template Meal", style = MaterialTheme.typography.labelSmall)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { showDeleteMealDialog = true }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete template meal", tint = MaterialTheme.colorScheme.error)
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
                }
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add food")
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
                if (meal.templateMealFoods.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No foods added yet", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        contentPadding = PaddingValues(bottom = 80.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(meal.templateMealFoods, key = { it.id.toInt() }) { food ->
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
            isEditing = uiState.editingFoodId != null,
            isSavingFood = uiState.isSavingFood,
            formState = uiState.formState,
            isSearchingBarcode = uiState.isSearchingBarcode,
            barcodeError = uiState.barcodeError,
            templateFoods = uiState.templateFoods,
            onDismiss = { showAddFoodDialog = false },
            onSave = {
                viewModel.saveFood {
                    showAddFoodDialog = false
                }
            },
            onUpdateForm = viewModel::updateFormState,
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
            title = { Text("Delete Template Meal") },
            text = { Text("Are you sure you want to delete this template meal?") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteMeal {
                            showDeleteMealDialog = false
                            onNavigateBack()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) { Text("Delete") }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteMealDialog = false }) { Text("Cancel") }
            }
        )
    }
}
