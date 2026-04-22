package com.nutrisense.mobile.ui.library

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun LibraryContent(
    onNavigateToTemplateMeal: (Int) -> Unit,
    viewModel: LibraryViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var selectedTab by rememberSaveable { mutableIntStateOf(0) }
    var showCreateMealDialog by remember { mutableStateOf(false) }
    var showCreateFoodDialog by remember { mutableStateOf(false) }
    var deleteMealId by remember { mutableStateOf<Int?>(null) }
    var deleteFoodId by remember { mutableStateOf<Int?>(null) }
    var editingFoodId by remember { mutableStateOf<Int?>(null) }

    LaunchedEffect(Unit) {
        viewModel.load()
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    if (selectedTab == 0) showCreateMealDialog = true else showCreateFoodDialog = true
                }
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add")
            }
        }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            TabRow(selectedTabIndex = selectedTab) {
                Tab(selected = selectedTab == 0, onClick = { selectedTab = 0 }, text = { Text("Meals") })
                Tab(selected = selectedTab == 1, onClick = { selectedTab = 1 }, text = { Text("Foods") })
            }

            if (selectedTab == 0) {
                if (uiState.templateMeals.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No template meals yet", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize().padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(uiState.templateMeals, key = { it.id.toInt() }) { meal ->
                            ElevatedCard(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { onNavigateToTemplateMeal(meal.id.toInt()) }
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(meal.name, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                                        IconButton(onClick = { deleteMealId = meal.id.toInt() }) {
                                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text("${meal.calories.toDouble().toInt()} KCAL", color = MaterialTheme.colorScheme.primary)
                                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                        Text("P: ${meal.protein.toDouble().toInt()}g", style = MaterialTheme.typography.labelSmall)
                                        Text("F: ${meal.fats.toDouble().toInt()}g", style = MaterialTheme.typography.labelSmall)
                                        Text("C: ${meal.carbs.toDouble().toInt()}g", style = MaterialTheme.typography.labelSmall)
                                    }
                                }
                            }
                        }
                        item { Spacer(modifier = Modifier.height(80.dp)) }
                    }
                }
            } else {
                if (uiState.templateFoods.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No template foods yet", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize().padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(uiState.templateFoods, key = { it.id.toInt() }) { food ->
                            ElevatedCard(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { editingFoodId = food.id.toInt() }
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column {
                                        Text(food.name, fontWeight = FontWeight.Bold)
                                        Text("${food.calories.toDouble().toInt()} kcal/100g", color = MaterialTheme.colorScheme.primary)
                                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                            Text("P: ${food.protein.toDouble().toInt()}g", style = MaterialTheme.typography.labelSmall)
                                            Text("F: ${food.fats.toDouble().toInt()}g", style = MaterialTheme.typography.labelSmall)
                                            Text("C: ${food.carbs.toDouble().toInt()}g", style = MaterialTheme.typography.labelSmall)
                                        }
                                    }
                                    IconButton(onClick = { deleteFoodId = food.id.toInt() }) {
                                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                                    }
                                }
                            }
                        }
                        item { Spacer(modifier = Modifier.height(80.dp)) }
                    }
                }
            }
        }
    }

    if (showCreateMealDialog) {
        CreateTemplateMealDialog(
            title = "Create Template Meal",
            onDismiss = { showCreateMealDialog = false },
            onSave = { name ->
                viewModel.createTemplateMeal(name) { id ->
                    showCreateMealDialog = false
                    onNavigateToTemplateMeal(id)
                }
            }
        )
    }

    if (showCreateFoodDialog) {
        CreateOrEditTemplateFoodDialog(
            title = "Create Template Food",
            onDismiss = { showCreateFoodDialog = false },
            onSave = { name, calories, protein, fats, carbs ->
                viewModel.createTemplateFood(name, calories, protein, fats, carbs)
                showCreateFoodDialog = false
            }
        )
    }

    deleteMealId?.let { id ->
        AlertDialog(
            onDismissRequest = { deleteMealId = null },
            title = { Text("Delete template meal?") },
            text = { Text("This meal template will be permanently deleted.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.deleteTemplateMeal(id)
                        deleteMealId = null
                    }
                ) { Text("Delete") }
            },
            dismissButton = {
                TextButton(onClick = { deleteMealId = null }) { Text("Cancel") }
            }
        )
    }

    deleteFoodId?.let { id ->
        AlertDialog(
            onDismissRequest = { deleteFoodId = null },
            title = { Text("Delete template food?") },
            text = { Text("This template food will be permanently deleted.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.deleteTemplateFood(id)
                        deleteFoodId = null
                    }
                ) { Text("Delete") }
            },
            dismissButton = {
                TextButton(onClick = { deleteFoodId = null }) { Text("Cancel") }
            }
        )
    }

    editingFoodId?.let { id ->
        val food = uiState.templateFoods.firstOrNull { it.id.toInt() == id }
        if (food != null) {
            CreateOrEditTemplateFoodDialog(
                title = "Edit Template Food",
                initialName = food.name,
                initialCalories = food.calories.toDouble().toInt().toString(),
                initialProtein = food.protein.toDouble().toInt().toString(),
                initialFats = food.fats.toDouble().toInt().toString(),
                initialCarbs = food.carbs.toDouble().toInt().toString(),
                onDismiss = { editingFoodId = null },
                onSave = { name, calories, protein, fats, carbs ->
                    viewModel.updateTemplateFood(id, name, calories, protein, fats, carbs)
                    editingFoodId = null
                }
            )
        }
    }
}

@Composable
private fun CreateTemplateMealDialog(
    title: String,
    onDismiss: () -> Unit,
    onSave: (String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Template name") },
                modifier = Modifier.fillMaxWidth()
            )
        },
        confirmButton = { TextButton(onClick = { onSave(name) }, enabled = name.isNotBlank()) { Text("Save") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

@Composable
private fun CreateOrEditTemplateFoodDialog(
    title: String,
    initialName: String = "",
    initialCalories: String = "0",
    initialProtein: String = "0",
    initialFats: String = "0",
    initialCarbs: String = "0",
    onDismiss: () -> Unit,
    onSave: (String, String, String, String, String) -> Unit
) {
    var name by remember { mutableStateOf(initialName) }
    var calories by remember { mutableStateOf(initialCalories) }
    var protein by remember { mutableStateOf(initialProtein) }
    var fats by remember { mutableStateOf(initialFats) }
    var carbs by remember { mutableStateOf(initialCarbs) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Food name") })
                OutlinedTextField(value = calories, onValueChange = { calories = it }, label = { Text("Calories /100g") })
                OutlinedTextField(value = protein, onValueChange = { protein = it }, label = { Text("Protein /100g") })
                OutlinedTextField(value = fats, onValueChange = { fats = it }, label = { Text("Fats /100g") })
                OutlinedTextField(value = carbs, onValueChange = { carbs = it }, label = { Text("Carbs /100g") })
            }
        },
        confirmButton = {
            TextButton(
                onClick = { onSave(name, calories, protein, fats, carbs) },
                enabled = name.isNotBlank()
            ) { Text("Save") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}
