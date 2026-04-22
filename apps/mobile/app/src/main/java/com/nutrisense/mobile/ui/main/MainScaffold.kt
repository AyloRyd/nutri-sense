package com.nutrisense.mobile.ui.main

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute
import com.nutrisense.mobile.ui.dashboard.DashboardScreen
import com.nutrisense.mobile.ui.diary.calendar.DiaryCalendarScreen
import com.nutrisense.mobile.ui.diary.date.DiaryDateScreen
import com.nutrisense.mobile.ui.diary.meal.MealDetailScreen
import com.nutrisense.mobile.ui.library.TemplateMealDetailScreen
import com.nutrisense.mobile.ui.more.MoreScreen
import com.nutrisense.mobile.ui.navigation.BottomNavItem
import com.nutrisense.mobile.ui.navigation.DashboardTab
import com.nutrisense.mobile.ui.navigation.DiaryTab
import com.nutrisense.mobile.ui.navigation.DiaryCalendarRoute
import com.nutrisense.mobile.ui.navigation.DiaryDateRoute
import com.nutrisense.mobile.ui.navigation.MealDetailRoute
import com.nutrisense.mobile.ui.navigation.CameraScannerRoute
import com.nutrisense.mobile.ui.navigation.TemplateMealDetailRoute
import androidx.navigation.compose.navigation
import com.nutrisense.mobile.ui.navigation.MoreTab
import com.nutrisense.mobile.ui.navigation.SettingsTab
import com.nutrisense.mobile.ui.settings.SettingsScreen
import java.time.LocalDate

@Composable
fun MainScaffold(
    onLogout: () -> Unit,
    navController: NavHostController = rememberNavController()
) {
    Scaffold(
        bottomBar = { NutriSenseBottomBar(navController = navController) }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = DashboardTab,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable<DashboardTab> {
                DashboardScreen(
                    onNavigateToDiary = {
                        navController.navigate(DiaryDateRoute(LocalDate.now().toString())) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true; restoreState = true
                        }
                    },
                    onNavigateToIot = {
                        navController.navigate(SettingsTab(scrollToIot = true)) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                        }
                    }
                )
            }
            navigation<DiaryTab>(startDestination = DiaryCalendarRoute) {
                composable<DiaryCalendarRoute> {
                    DiaryCalendarScreen(
                        onNavigateToDate = { date ->
                            navController.navigate(DiaryDateRoute(date))
                        }
                    )
                }
                composable<DiaryDateRoute> { backStackEntry ->
                    val route = backStackEntry.toRoute<DiaryDateRoute>()
                    DiaryDateScreen(
                        date = route.date,
                        onNavigateBack = { navController.popBackStack() },
                        onNavigateToMeal = { mealId ->
                            navController.navigate(MealDetailRoute(mealId))
                        }
                    )
                }
                composable<MealDetailRoute> { backStackEntry ->
                    val route = backStackEntry.toRoute<MealDetailRoute>()
                    val barcodeResult = backStackEntry.savedStateHandle.getStateFlow<String?>("barcode_result", null).collectAsStateWithLifecycle()
                    MealDetailScreen(
                        mealId = route.mealId,
                        onNavigateBack = { navController.popBackStack() },
                        onNavigateToScanner = { navController.navigate(CameraScannerRoute) },
                        barcodeResultFlow = barcodeResult.value,
                        clearBarcodeResult = { backStackEntry.savedStateHandle.remove<String>("barcode_result") }
                    )
                }
                composable<TemplateMealDetailRoute> { backStackEntry ->
                    val route = backStackEntry.toRoute<TemplateMealDetailRoute>()
                    val barcodeResult = backStackEntry.savedStateHandle.getStateFlow<String?>("barcode_result", null).collectAsStateWithLifecycle()
                    TemplateMealDetailScreen(
                        templateMealId = route.templateMealId,
                        onNavigateBack = { navController.popBackStack() },
                        onNavigateToScanner = { navController.navigate(CameraScannerRoute) },
                        barcodeResultFlow = barcodeResult.value,
                        clearBarcodeResult = { backStackEntry.savedStateHandle.remove<String>("barcode_result") }
                    )
                }
                composable<CameraScannerRoute> {
                    com.nutrisense.mobile.ui.components.QrScannerScreen(
                        onNavigateBack = { navController.popBackStack() },
                        onBarcodeScanned = { barcode ->
                            navController.previousBackStackEntry
                                ?.savedStateHandle
                                ?.set("barcode_result", barcode)
                            navController.popBackStack()
                        }
                    )
                }
            }
            composable<MoreTab>     {
                MoreScreen(
                    onNavigateToTemplateMeal = { templateMealId ->
                        navController.navigate(TemplateMealDetailRoute(templateMealId))
                    }
                )
            }
            composable<SettingsTab> { backStackEntry ->
                val args = backStackEntry.toRoute<SettingsTab>()
                SettingsScreen(
                    onLogout = onLogout,
                    scrollToIot = args.scrollToIot
                )
            }
        }
    }
}

@Composable
private fun NutriSenseBottomBar(navController: NavHostController) {
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentDest = backStackEntry?.destination

    NavigationBar {
        BottomNavItem.entries.forEach { item ->
            val selected = currentDest?.hierarchy?.any { it.hasRoute(item.route::class) } == true
            NavigationBarItem(
                selected = selected,
                icon = { Icon(item.icon, contentDescription = item.label) },
                label = { Text(item.label) },
                onClick = {
                    navController.navigate(item.route) {
                        popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                        launchSingleTop = true; restoreState = true
                    }
                }
            )
        }
    }
}
