package com.nutrisense.mobile.ui.more

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
                        PlanCard(plan = plan, onDelete = { viewModel.delete(plan.id) })
                    }
                    item { Spacer(Modifier.height(80.dp)) }
                }
            }
        }
    }

    if (showDialog) {
        CreatePlanDialog(
            isCreating = state.isCreating,
            error = state.error,
            missingProfileData = state.missingProfileData,
            hasProfile = state.hasProfile,
            hasMeasurements = state.hasMeasurements,
            onDismiss = { showDialog = false },
            onCreate = { startDate, goal, autoCalc, cal, pro, fat, carb ->
                viewModel.create(startDate, goal, autoCalc, cal, pro, fat, carb)
                showDialog = false
            }
        )
    }
}

@Composable
private fun PlanCard(plan: PlanEntity, onDelete: () -> Unit) {
    var showConfirm by remember { mutableStateOf(false) }

    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
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
    onDismiss: () -> Unit,
    onCreate: (String, CreatePlanDto.Goal, Boolean, Int?, Int?, Int?, Int?) -> Unit
) {
    var startDate by rememberSaveable { mutableStateOf(LocalDate.now().toString()) }
    var goal by rememberSaveable { mutableStateOf(CreatePlanDto.Goal.MAINTAIN) }
    var isAutoCalc by rememberSaveable { mutableStateOf(true) }
    var calories by rememberSaveable { mutableStateOf("") }
    var protein by rememberSaveable { mutableStateOf("") }
    var fats by rememberSaveable { mutableStateOf("") }
    var carbs by rememberSaveable { mutableStateOf("") }
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
                    else Text("Create")
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
                            MeasurementCard(measurement = m, onDelete = { viewModel.delete(m.id) })
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
            onDismiss = { showDialog = false },
            onCreate = { w, h, a, d ->
                viewModel.create(w, h, a, d)
                showDialog = false
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
private fun MeasurementCard(measurement: MeasurementEntity, onDelete: () -> Unit) {
    var showConfirm by remember { mutableStateOf(false) }
    val dateStr = measurement.date.toLocalDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))

    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
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
    onDismiss: () -> Unit,
    onCreate: (Double, Double, Double, String) -> Unit
) {
    var weight by rememberSaveable { mutableStateOf("") }
    var height by rememberSaveable { mutableStateOf("") }
    var activity by rememberSaveable { mutableStateOf("1.2") }
    var date by rememberSaveable { mutableStateOf(LocalDate.now().toString()) }

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
                else Text("Save")
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
