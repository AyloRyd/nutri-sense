package com.nutrisense.mobile.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.nutrisense.mobile.ui.auth.LoginScreen
import com.nutrisense.mobile.ui.auth.RegisterScreen
import com.nutrisense.mobile.ui.dashboard.DashboardScreen
import com.nutrisense.mobile.data.AuthRepository

@Composable
fun NutriSenseNavGraph(
    navController: NavHostController = rememberNavController(),
    authRepository: AuthRepository
) {
    val startDestination = if (authRepository.hasValidToken()) DashboardRoute else LoginRoute

    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable<LoginRoute> {
            LoginScreen(
                onNavigateToRegister = {
                    navController.navigate(RegisterRoute) {
                        popUpTo(LoginRoute) { inclusive = true }
                    }
                },
                onLoginSuccess = {
                    navController.navigate(DashboardRoute) {
                        popUpTo(LoginRoute) { inclusive = true }
                    }
                }
            )
        }

        composable<RegisterRoute> {
            RegisterScreen(
                onNavigateToLogin = {
                    navController.navigate(LoginRoute) {
                        popUpTo(RegisterRoute) { inclusive = true }
                    }
                },
                onRegisterSuccess = {
                    navController.navigate(DashboardRoute) {
                        popUpTo(RegisterRoute) { inclusive = true }
                    }
                }
            )
        }

        composable<DashboardRoute> {
            DashboardScreen(
                onLogout = {
                    authRepository.logout()
                    navController.navigate(LoginRoute) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
    }
}
