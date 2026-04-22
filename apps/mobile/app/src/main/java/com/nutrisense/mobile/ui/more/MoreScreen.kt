package com.nutrisense.mobile.ui.more

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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuAnchorType
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
import com.nutrisense.mobile.model.CreatePlanDto
import com.nutrisense.mobile.model.MeasurementEntity
import com.nutrisense.mobile.model.PlanEntity
import com.nutrisense.mobile.ui.library.LibraryContent
import java.time.LocalDate
import com.patrykandpatrick.vico.compose.axis.horizontal.rememberBottomAxis
import com.patrykandpatrick.vico.compose.axis.vertical.rememberStartAxis
import com.patrykandpatrick.vico.compose.chart.Chart
import com.patrykandpatrick.vico.compose.chart.line.lineChart
import com.patrykandpatrick.vico.compose.m3.style.m3ChartStyle
import com.patrykandpatrick.vico.compose.style.ProvideChartStyle
import com.patrykandpatrick.vico.core.axis.AxisPosition
import com.patrykandpatrick.vico.core.axis.formatter.AxisValueFormatter
import com.patrykandpatrick.vico.core.entry.ChartEntryModelProducer
import com.patrykandpatrick.vico.core.entry.FloatEntry
import java.time.format.DateTimeFormatter

private val tabTitles = listOf("Plans", "Measurements", "Library")

@Composable
fun MoreScreen(
    onNavigateToTemplateMeal: (Int) -> Unit = {}
) {
    var selectedTab by rememberSaveable { mutableIntStateOf(0) }

    Column(modifier = Modifier.fillMaxSize()) {
        TabRow(selectedTabIndex = selectedTab) {
            tabTitles.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(title, fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal) }
                )
            }
        }
        when (selectedTab) {
            0 -> PlansContent()
            1 -> MeasurementsContent()
            2 -> LibraryContent(onNavigateToTemplateMeal = onNavigateToTemplateMeal)
        }
    }
}

// ─────────────────────────── PLANS ───────────────────────────

@Composable
private fun PlansContent(
    viewModel: PlansViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var showDialog by remember { mutableStateOf(false) }
    var editingPlan by remember { mutableStateOf<PlanEntity?>(null) }

    LaunchedEffect(Unit) {
        viewModel.load()
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(onClick = { showDialog = true }) {
                Icon(Icons.Default.Add, "New plan")
            }
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when {
                state.isLoading -> CircularProgressIndicator(Modifier.align(Alignment.Center))
                state.plans.isEmpty() -> EmptyState(
                    title = "No plans yet",
                    subtitle = "Create your first nutrition plan",
                    modifier = Modifier.align(Alignment.Center)
                )
                else -> LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(state.plans, key = { it.id.toInt() }) { plan ->
                        PlanCard(
                            plan = plan,
                            onClick = {
                                editingPlan = plan
                                showDialog = true
                            },
                            onDelete = { viewModel.delete(plan.id) }
                        )
                    }
                    item { Spacer(Modifier.height(80.dp)) }
                }
            }
        }
    }

    if (showDialog) {
        val goalFromPlan = when (editingPlan?.plan) {
            PlanEntity.Plan.MAINTAIN -> CreatePlanDto.Goal.MAINTAIN
            PlanEntity.Plan.GAIN -> CreatePlanDto.Goal.GAIN
            PlanEntity.Plan.LOSE -> CreatePlanDto.Goal.LOSE
            null -> CreatePlanDto.Goal.MAINTAIN
        }
        CreatePlanDialog(
            isCreating = state.isCreating,
            error = state.error,
            missingProfileData = state.missingProfileData,
            hasProfile = state.hasProfile,
            hasMeasurements = state.hasMeasurements,
            initialStartDate = editingPlan?.startDate?.toLocalDate()?.toString() ?: LocalDate.now().toString(),
            initialGoal = goalFromPlan,
            initialIsAutoCalc = editingPlan == null,
            initialCalories = editingPlan?.dayCalories?.toInt()?.toString() ?: "",
            initialProtein = editingPlan?.dayProtein?.toInt()?.toString() ?: "",
            initialFats = editingPlan?.dayFats?.toInt()?.toString() ?: "",
            initialCarbs = editingPlan?.dayCarbs?.toInt()?.toString() ?: "",
            confirmText = if (editingPlan == null) "Create" else "Save",
            onDismiss = {
                showDialog = false
                editingPlan = null
            },
            onCreate = { startDate, goal, autoCalc, cal, pro, fat, carb ->
                val plan = editingPlan
                if (plan == null) {
                    viewModel.create(startDate, goal, autoCalc, cal, pro, fat, carb)
                } else {
                    viewModel.update(plan.id, startDate, goal, autoCalc, cal, pro, fat, carb)
                }
                showDialog = false
                editingPlan = null
            }
        )
    }
}

@Composable
private fun PlanCard(plan: PlanEntity, onClick: () -> Unit, onDelete: () -> Unit) {
    var showConfirm by remember { mutableStateOf(false) }

    ElevatedCard(modifier = Modifier.fillMaxWidth().clickable(onClick = onClick)) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("NUTRITION PLAN", style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary)
                    Text(
                        text = "Starts ${plan.startDate.toLocalDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                IconButton(onClick = { showConfirm = true }) {
                    Icon(Icons.Default.Delete, "Delete", tint = MaterialTheme.colorScheme.error)
                }
            }
            HorizontalDivider()
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                MacroChip("Goal", plan.plan.value.replaceFirstChar { it.uppercase() })
                MacroChip("Cal", plan.dayCalories.toInt().toString())
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                MacroChip("Protein", "${plan.dayProtein.toInt()}g")
                MacroChip("Fats", "${plan.dayFats.toInt()}g")
                MacroChip("Carbs", "${plan.dayCarbs.toInt()}g")
            }
        }
    }

    if (showConfirm) {
        AlertDialog(
            onDismissRequest = { showConfirm = false },
            title = { Text("Delete plan?") },
            text = { Text("This plan will be permanently removed.") },
            confirmButton = {
                Button(onClick = { showConfirm = false; onDelete() },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) { Text("Delete") }
            },
            dismissButton = { TextButton(onClick = { showConfirm = false }) { Text("Cancel") } }
        )
    }
}

@Composable
private fun MacroChip(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CreatePlanDialog(
    isCreating: Boolean,
    error: String?,
    missingProfileData: Boolean,
    hasProfile: Boolean,
    hasMeasurements: Boolean,
    initialStartDate: String,
    initialGoal: CreatePlanDto.Goal,
    initialIsAutoCalc: Boolean,
    initialCalories: String,
    initialProtein: String,
    initialFats: String,
    initialCarbs: String,
    confirmText: String,
    onDismiss: () -> Unit,
    onCreate: (String, CreatePlanDto.Goal, Boolean, Int?, Int?, Int?, Int?) -> Unit
) {
    var startDate by rememberSaveable(initialStartDate) { mutableStateOf(initialStartDate) }
    var goal by rememberSaveable(initialGoal) { mutableStateOf(initialGoal) }
    var isAutoCalc by rememberSaveable(initialIsAutoCalc) { mutableStateOf(initialIsAutoCalc) }
    var calories by rememberSaveable(initialCalories) { mutableStateOf(initialCalories) }
    var protein by rememberSaveable(initialProtein) { mutableStateOf(initialProtein) }
    var fats by rememberSaveable(initialFats) { mutableStateOf(initialFats) }
    var carbs by rememberSaveable(initialCarbs) { mutableStateOf(initialCarbs) }
    var goalExpanded by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Create Plan") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (missingProfileData) {
                    // ── Prerequisites alert (matches web frontend) ──
                    ElevatedCard(
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                Icons.Default.Warning,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.height(32.dp).width(32.dp)
                            )
                            Text(
                                "Missing required data",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.error
                            )
                            Spacer(Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = if (hasProfile) "✅" else "❌",
                                    style = MaterialTheme.typography.bodyMedium
                                )
                                Spacer(Modifier.width(8.dp))
                                Text(
                                    "Physical profile (Sex & Date of Birth)",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = if (hasMeasurements) "✅" else "❌",
                                    style = MaterialTheme.typography.bodyMedium
                                )
                                Spacer(Modifier.width(8.dp))
                                Text(
                                    "At least one measurement logged",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Spacer(Modifier.height(8.dp))
                            Text(
                                "Go to Settings to set profile data, and Measurements tab to add entries.",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                } else {
                    // ── Normal create form ──
                    OutlinedTextField(
                        value = startDate, onValueChange = { startDate = it },
                        label = { Text("Start date (yyyy-MM-dd)") },
                        singleLine = true, modifier = Modifier.fillMaxWidth()
                    )
                    ExposedDropdownMenuBox(expanded = goalExpanded, onExpandedChange = { goalExpanded = it }) {
                        OutlinedTextField(
                            value = goal.value.replaceFirstChar { it.uppercase() },
                            onValueChange = {}, readOnly = true,
                            label = { Text("Goal") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(goalExpanded) },
                            modifier = Modifier.fillMaxWidth().menuAnchor(MenuAnchorType.PrimaryNotEditable)
                        )
                        ExposedDropdownMenu(expanded = goalExpanded, onDismissRequest = { goalExpanded = false }) {
                            CreatePlanDto.Goal.entries.forEach { g ->
                                DropdownMenuItem(
                                    text = { Text(g.value.replaceFirstChar { it.uppercase() }) },
                                    onClick = { goal = g; goalExpanded = false }
                                )
                            }
                        }
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = isAutoCalc, onCheckedChange = { isAutoCalc = it })
                        Text("Auto-calculate macros", style = MaterialTheme.typography.bodySmall)
                    }
                    if (!isAutoCalc) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(value = calories, onValueChange = { calories = it },
                                label = { Text("Cal") }, singleLine = true, modifier = Modifier.weight(1f))
                            OutlinedTextField(value = protein, onValueChange = { protein = it },
                                label = { Text("Pro") }, singleLine = true, modifier = Modifier.weight(1f))
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(value = fats, onValueChange = { fats = it },
                                label = { Text("Fat") }, singleLine = true, modifier = Modifier.weight(1f))
                            OutlinedTextField(value = carbs, onValueChange = { carbs = it },
                                label = { Text("Carb") }, singleLine = true, modifier = Modifier.weight(1f))
                        }
                    }
                    if (error != null) {
                        Text(error, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        },
        confirmButton = {
            if (missingProfileData) {
                TextButton(onClick = onDismiss) { Text("Close") }
            } else {
                Button(
                    onClick = {
                        onCreate(startDate, goal, isAutoCalc,
                            calories.toIntOrNull(), protein.toIntOrNull(),
                            fats.toIntOrNull(), carbs.toIntOrNull())
                    },
                    enabled = !isCreating
                ) {
                    if (isCreating) CircularProgressIndicator(Modifier.height(16.dp).width(16.dp))
                    else Text(confirmText)
                }
            }
        },
        dismissButton = {
            if (!missingProfileData) {
                TextButton(onClick = onDismiss) { Text("Cancel") }
            }
        }
    )
}

// ─────────────────────────── MEASUREMENTS ───────────────────────────

@Composable
private fun MeasurementsContent(viewModel: MeasurementsViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var showDialog by remember { mutableStateOf(false) }
    var editingMeasurement by remember { mutableStateOf<MeasurementEntity?>(null) }

    LaunchedEffect(Unit) {
        viewModel.load()
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(onClick = { showDialog = true }) {
                Icon(Icons.Default.Add, "New measurement")
            }
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when {
                state.isLoading -> CircularProgressIndicator(Modifier.align(Alignment.Center))
                state.measurements.isEmpty() -> EmptyState(
                    title = "No measurements yet",
                    subtitle = "Log your first body measurement",
                    modifier = Modifier.align(Alignment.Center)
                )
                else -> {
                    val sorted = state.measurements.sortedByDescending { it.date }
                    LazyColumn(
                        modifier = Modifier.fillMaxSize().padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        item {
                            MeasurementsChart(measurements = state.measurements)
                        }
                        item {
                            Text("History", style = androidx.compose.material3.MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        }
                        items(sorted, key = { it.id.toInt() }) { m ->
                            MeasurementCard(
                                measurement = m,
                                onClick = {
                                    editingMeasurement = m
                                    showDialog = true
                                },
                                onDelete = { viewModel.delete(m.id) }
                            )
                        }
                        item { Spacer(Modifier.height(80.dp)) }
                    }
                }
            }
        }
    }

    if (showDialog) {
        CreateMeasurementDialog(
            isCreating = state.isCreating,
            initialWeight = editingMeasurement?.weight?.toPlainString() ?: "",
            initialHeight = editingMeasurement?.height?.toPlainString() ?: "",
            initialActivity = editingMeasurement?.activity?.toPlainString() ?: "1.2",
            initialDate = editingMeasurement?.date?.toLocalDate()?.toString() ?: LocalDate.now().toString(),
            confirmText = if (editingMeasurement == null) "Save" else "Update",
            onDismiss = {
                showDialog = false
                editingMeasurement = null
            },
            onCreate = { w, h, a, d ->
                val measurement = editingMeasurement
                if (measurement == null) {
                    viewModel.create(w, h, a, d)
                } else {
                    viewModel.update(measurement.id, w, h, a, d)
                }
                showDialog = false
                editingMeasurement = null
            }
        )
    }
}

@Composable
private fun MeasurementsChart(measurements: List<MeasurementEntity>) {
    val chartEntryModelProducer = remember(measurements) {
        val sortedList = measurements.sortedBy { it.date }
        val entries = sortedList.mapIndexed { index, measurement ->
            FloatEntry(x = index.toFloat(), y = measurement.weight.toFloat())
        }
        ChartEntryModelProducer(entries)
    }

    val bottomAxisValueFormatter = AxisValueFormatter<AxisPosition.Horizontal.Bottom> { value, _ ->
        val sortedList = measurements.sortedBy { it.date }
        val index = value.toInt()
        if (index in sortedList.indices) {
            sortedList[index].date.toLocalDate().format(DateTimeFormatter.ofPattern("MM-dd"))
        } else ""
    }

    androidx.compose.material3.ElevatedCard(modifier = Modifier.fillMaxWidth()) {
        androidx.compose.foundation.layout.Column(modifier = Modifier.padding(16.dp)) {
            Text("Weight Trend", style = androidx.compose.material3.MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            androidx.compose.foundation.layout.Spacer(Modifier.height(16.dp))
            ProvideChartStyle(m3ChartStyle()) {
                Chart(
                    chart = lineChart(),
                    chartModelProducer = chartEntryModelProducer,
                    startAxis = rememberStartAxis(),
                    bottomAxis = rememberBottomAxis(valueFormatter = bottomAxisValueFormatter),
                    modifier = Modifier.fillMaxWidth().height(200.dp)
                )
            }
        }
    }
}

@Composable
private fun MeasurementCard(measurement: MeasurementEntity, onClick: () -> Unit, onDelete: () -> Unit) {
    var showConfirm by remember { mutableStateOf(false) }
    val dateStr = measurement.date.toLocalDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))

    ElevatedCard(modifier = Modifier.fillMaxWidth().clickable(onClick = onClick)) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("${measurement.weight} kg", style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold)
                    Text(dateStr, style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary)
                }
                IconButton(onClick = { showConfirm = true }) {
                    Icon(Icons.Default.Delete, "Delete", tint = MaterialTheme.colorScheme.error)
                }
            }
            HorizontalDivider()
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                MacroChip("Height", "${measurement.height} cm")
                MacroChip("Activity", measurement.activity.toPlainString())
            }
        }
    }

    if (showConfirm) {
        AlertDialog(
            onDismissRequest = { showConfirm = false },
            title = { Text("Delete measurement?") },
            text = { Text("This entry will be permanently removed.") },
            confirmButton = {
                Button(onClick = { showConfirm = false; onDelete() },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) { Text("Delete") }
            },
            dismissButton = { TextButton(onClick = { showConfirm = false }) { Text("Cancel") } }
        )
    }
}

@Composable
private fun CreateMeasurementDialog(
    isCreating: Boolean,
    initialWeight: String,
    initialHeight: String,
    initialActivity: String,
    initialDate: String,
    confirmText: String,
    onDismiss: () -> Unit,
    onCreate: (Double, Double, Double, String) -> Unit
) {
    var weight by rememberSaveable(initialWeight) { mutableStateOf(initialWeight) }
    var height by rememberSaveable(initialHeight) { mutableStateOf(initialHeight) }
    var activity by rememberSaveable(initialActivity) { mutableStateOf(initialActivity) }
    var date by rememberSaveable(initialDate) { mutableStateOf(initialDate) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("New Measurement") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(value = date, onValueChange = { date = it },
                    label = { Text("Date (yyyy-MM-dd)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = weight, onValueChange = { weight = it },
                    label = { Text("Weight (kg)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = height, onValueChange = { height = it },
                    label = { Text("Height (cm)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = activity, onValueChange = { activity = it },
                    label = { Text("Activity level (1.0–2.5)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val w = weight.replace(',', '.').toDoubleOrNull() ?: return@Button
                    val h = height.replace(',', '.').toDoubleOrNull() ?: return@Button
                    val a = activity.replace(',', '.').toDoubleOrNull() ?: return@Button
                    
                    // NestJS might require ISO format if it's an offset datetime.
                    // We'll append midnight UTC to the simple date.
                    val isoDate = if(date.length == 10) "${date}T00:00:00Z" else date
                    
                    onCreate(w, h, a, isoDate)
                },
                enabled = !isCreating && weight.isNotBlank() && height.isNotBlank()
            ) {
                if (isCreating) CircularProgressIndicator(Modifier.height(16.dp).width(16.dp))
                else Text(confirmText)
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

// ─────────────────────────── Shared ───────────────────────────

@Composable
private fun EmptyState(title: String, subtitle: String, modifier: Modifier = Modifier) {
    Column(modifier = modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(subtitle, style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
