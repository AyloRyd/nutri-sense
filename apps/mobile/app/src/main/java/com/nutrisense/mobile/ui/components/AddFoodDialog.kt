package com.nutrisense.mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.ExposedDropdownMenuDefaults.TrailingIcon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.nutrisense.mobile.model.TemplateFoodEntity

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddFoodDialog(
    isEditing: Boolean,
    isSavingFood: Boolean,
    formState: FoodFormState,
    isSearchingBarcode: Boolean,
    barcodeError: String?,
    templateFoods: List<TemplateFoodEntity>,
    onDismiss: () -> Unit,
    onSave: () -> Unit,
    onUpdateForm: (FoodFormState) -> Unit,
    onSearchBarcode: (String) -> Unit,
    onNavigateToScanner: () -> Unit,
    onPrefillFromTemplateFood: (TemplateFoodEntity) -> Unit
) {
    var selectedTab by remember { mutableStateOf(0) }
    var barcodeInput by remember { mutableStateOf("") }
    var templateMenuExpanded by remember { mutableStateOf(false) }
    var selectedTemplateName by remember { mutableStateOf("") }

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
                        listOf("Manual", "Barcode", "Library").forEachIndexed { index, label ->
                            Tab(
                                selected = selectedTab == index,
                                onClick = { selectedTab = index },
                                text = { Text(label) }
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                if (!isEditing && selectedTab == 1) {
                    Button(
                        onClick = onNavigateToScanner,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)
                    ) {
                        androidx.compose.material3.Icon(Icons.Default.Search, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("SCAN WITH CAMERA")
                    }

                    Text(
                        "OR ENTER MANUALLY",
                        style = MaterialTheme.typography.labelSmall,
                        modifier = Modifier
                            .padding(vertical = 12.dp)
                            .align(Alignment.CenterHorizontally),
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        OutlinedTextField(
                            value = barcodeInput,
                            onValueChange = { barcodeInput = it },
                            label = { Text("Barcode ID") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        androidx.compose.material3.IconButton(
                            onClick = { onSearchBarcode(barcodeInput) },
                            modifier = Modifier.background(
                                MaterialTheme.colorScheme.primaryContainer,
                                RoundedCornerShape(8.dp)
                            )
                        ) {
                            if (isSearchingBarcode) {
                                CircularProgressIndicator(modifier = Modifier.size(24.dp))
                            } else {
                                androidx.compose.material3.Icon(
                                    Icons.Default.Search,
                                    contentDescription = "Search",
                                    tint = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                            }
                        }
                    }
                    if (barcodeError != null) {
                        Text(barcodeError, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                if (!isEditing && selectedTab == 2) {
                    ExposedDropdownMenuBox(
                        expanded = templateMenuExpanded,
                        onExpandedChange = { templateMenuExpanded = it }
                    ) {
                        OutlinedTextField(
                            value = selectedTemplateName,
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Template food") },
                            trailingIcon = { TrailingIcon(expanded = templateMenuExpanded) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .menuAnchor(MenuAnchorType.PrimaryNotEditable)
                        )
                        ExposedDropdownMenu(
                            expanded = templateMenuExpanded,
                            onDismissRequest = { templateMenuExpanded = false }
                        ) {
                            templateFoods.forEach { templateFood ->
                                DropdownMenuItem(
                                    text = {
                                        Text("${templateFood.name} (${templateFood.calories.toDouble().toInt()} kcal/100g)")
                                    },
                                    onClick = {
                                        selectedTemplateName = templateFood.name
                                        templateMenuExpanded = false
                                        onPrefillFromTemplateFood(templateFood)
                                    }
                                )
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                OutlinedTextField(
                    value = formState.name,
                    onValueChange = { onUpdateForm(formState.copy(name = it)) },
                    label = { Text("Food name") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = formState.weight,
                        onValueChange = { onUpdateForm(formState.copy(weight = it)) },
                        label = { Text("Weight (g)") },
                        modifier = Modifier.weight(1f),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                    OutlinedTextField(
                        value = formState.calories,
                        onValueChange = { onUpdateForm(formState.copy(calories = it)) },
                        label = { Text("Calories") },
                        modifier = Modifier.weight(1f),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = formState.protein,
                        onValueChange = { onUpdateForm(formState.copy(protein = it)) },
                        label = { Text("Protein") },
                        modifier = Modifier.weight(1f),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                    OutlinedTextField(
                        value = formState.fats,
                        onValueChange = { onUpdateForm(formState.copy(fats = it)) },
                        label = { Text("Fats") },
                        modifier = Modifier.weight(1f),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                    OutlinedTextField(
                        value = formState.carbs,
                        onValueChange = { onUpdateForm(formState.copy(carbs = it)) },
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
                enabled = formState.name.isNotBlank() && !isSavingFood
            ) {
                if (isSavingFood) CircularProgressIndicator(modifier = Modifier.size(24.dp))
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
