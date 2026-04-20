package com.nutrisense.mobile.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material.icons.filled.Settings
import androidx.compose.ui.graphics.vector.ImageVector
import kotlinx.serialization.Serializable

// --- Top-level routes ---

@Serializable
object LoginRoute

@Serializable
object RegisterRoute

@Serializable
object MainRoute   // host for the bottom-nav scaffold

// --- Bottom-nav tab routes (nested inside MainRoute) ---

@Serializable
object DashboardTab

@Serializable
object DiaryTab

@Serializable
data class DiaryDateRoute(val date: String)

@Serializable
data class MealDetailRoute(val mealId: Int)

@Serializable
object DiaryCalendarRoute

@Serializable
object MoreTab

@Serializable
data class SettingsTab(val scrollToIot: Boolean = false)

// Helper enum used by the NavigationBar
enum class BottomNavItem(
    val route: Any,
    val label: String,
    val icon: ImageVector
) {
    DASHBOARD(DashboardTab, "Dashboard", Icons.Default.Home),
    DIARY(DiaryTab, "Diary", Icons.Default.DateRange),
    MORE(MoreTab, "More", Icons.Default.MoreHoriz),
    SETTINGS(SettingsTab(), "Settings", Icons.Default.Settings)
}
