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
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute
import com.nutrisense.mobile.ui.dashboard.DashboardScreen
import com.nutrisense.mobile.ui.diary.DiaryScreen
import com.nutrisense.mobile.ui.more.MoreScreen
import com.nutrisense.mobile.ui.navigation.BottomNavItem
import com.nutrisense.mobile.ui.navigation.DashboardTab
import com.nutrisense.mobile.ui.navigation.DiaryTab
import com.nutrisense.mobile.ui.navigation.MoreTab
import com.nutrisense.mobile.ui.navigation.SettingsTab
import com.nutrisense.mobile.ui.settings.SettingsScreen

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
                        navController.navigate(DiaryTab) {
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
            composable<DiaryTab>    { DiaryScreen() }
            composable<MoreTab>     { MoreScreen() }
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
            val selected = currentDest?.hasRoute(item.route::class) == true
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
