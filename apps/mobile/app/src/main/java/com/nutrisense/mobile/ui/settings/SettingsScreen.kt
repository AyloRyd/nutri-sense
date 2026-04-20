package com.nutrisense.mobile.ui.settings

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material.icons.filled.WifiOff
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInParent
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.nutrisense.mobile.model.UpdateUserDto
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onLogout: () -> Unit,
    scrollToIot: Boolean = false,
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val scrollState = rememberScrollState()

    // Sync local form fields when user loads
    var username by rememberSaveable(state.user) { mutableStateOf(state.user?.username ?: "") }
    var dob by rememberSaveable(state.user) {
        mutableStateOf(state.user?.dateOfBirth?.toLocalDate()?.toString() ?: "")
    }
    var sex by rememberSaveable(state.user) {
        mutableStateOf(
            when (state.user?.sex) {
                com.nutrisense.mobile.model.UserEntity.Sex.MALE -> UpdateUserDto.Sex.MALE
                com.nutrisense.mobile.model.UserEntity.Sex.FEMALE -> UpdateUserDto.Sex.FEMALE
                null -> null
            }
        )
    }
    var oldPassword by rememberSaveable { mutableStateOf("") }
    var newPassword by rememberSaveable { mutableStateOf("") }
    // Pre-fill serial from saved preferences
    var serialNumber by rememberSaveable { mutableStateOf(viewModel.savedSerial) }
    var showDeleteDialog by remember { mutableStateOf(false) }

    // Track the Y position of the IoT section for scrolling
    var iotSectionY by remember { mutableStateOf(0f) }

    // Scroll to IoT section when requested (e.g. from Dashboard IoT card)
    LaunchedEffect(scrollToIot, state.isLoading) {
        if (scrollToIot && !state.isLoading && iotSectionY > 0f) {
            delay(150) // small delay to ensure layout is measured
            scrollState.animateScrollTo(iotSectionY.toInt())
        }
    }

    if (state.isLoading) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        // Title
        Column {
            Text("Settings", style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold)
            Text(state.user?.email ?: "", style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
        }

        // § 01 — Identity
        SettingsSection(index = "01", title = "Profile") {
            OutlinedTextField(
                value = username,
                onValueChange = { username = it },
                label = { Text("Username") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = dob,
                onValueChange = { dob = it },
                label = { Text("Date of birth (yyyy-MM-dd)") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            SexDropdown(selected = sex, onSelect = { sex = it })

            Row(verticalAlignment = Alignment.CenterVertically) {
                Button(
                    onClick = { viewModel.updateProfile(username, dob.takeIf { it.isNotBlank() }, sex) },
                    enabled = !state.isUpdatingProfile
                ) {
                    if (state.isUpdatingProfile) CircularProgressIndicator(Modifier.height(16.dp).width(16.dp))
                    else Text("Save profile")
                }
                state.profileMsg?.let { (success, msg) ->
                    Spacer(Modifier.width(12.dp))
                    FeedbackChip(success, msg)
                }
            }
        }

        // § 02 — Password
        SettingsSection(index = "02", title = "Security") {
            OutlinedTextField(
                value = oldPassword,
                onValueChange = { oldPassword = it },
                label = { Text("Current password") },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = newPassword,
                onValueChange = { newPassword = it },
                label = { Text("New password") },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth()
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Button(
                    onClick = {
                        viewModel.changePassword(oldPassword, newPassword)
                        oldPassword = ""; newPassword = ""
                    },
                    enabled = !state.isChangingPassword && oldPassword.isNotBlank() && newPassword.isNotBlank(),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)
                ) {
                    if (state.isChangingPassword) CircularProgressIndicator(Modifier.height(16.dp).width(16.dp))
                    else Text("Change password")
                }
                state.passwordMsg?.let { (success, msg) ->
                    Spacer(Modifier.width(12.dp))
                    FeedbackChip(success, msg)
                }
            }
        }

        // § 03 — IoT Scale (with position tracking for scroll-to)
        Column(modifier = Modifier.onGloballyPositioned { coords ->
            iotSectionY = coords.positionInParent().y
        }) {
            SettingsSection(index = "03", title = "Smart Scale") {
                IotStatusRow(
                    isLinked = state.iotStatus?.isLinked == true,
                    serialNumber = state.iotStatus?.serialNumber,
                    isUnlinking = state.isUnlinkingDevice,
                    onUnlink = viewModel::unlinkDevice
                )
                if (state.iotStatus?.isLinked != true) {
                    OutlinedTextField(
                        value = serialNumber,
                        onValueChange = { serialNumber = it.uppercase() },
                        label = { Text("Device serial (e.g. SC-4A2B-9F1D)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Button(
                            onClick = { viewModel.linkDevice(serialNumber) },
                            enabled = !state.isLinkingDevice && serialNumber.isNotBlank()
                        ) {
                            if (state.isLinkingDevice) CircularProgressIndicator(Modifier.height(16.dp).width(16.dp))
                            else Text("Link device")
                        }
                        state.iotMsg?.let { (success, msg) ->
                            Spacer(Modifier.width(12.dp))
                            FeedbackChip(success, msg)
                        }
                    }
                } else {
                    state.iotMsg?.let { (success, msg) ->
                        FeedbackChip(success, msg)
                    }
                }
            }
        }

        // § 04 — Danger zone & Logout
        SettingsSection(index = "04", title = "Account", isDanger = true) {
            OutlinedButton(
                onClick = onLogout,
                modifier = Modifier.fillMaxWidth()
            ) { Text("Logout") }

            Button(
                onClick = { showDeleteDialog = true },
                enabled = !state.isDeletingAccount,
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                modifier = Modifier.fillMaxWidth()
            ) {
                if (state.isDeletingAccount) CircularProgressIndicator(Modifier.height(16.dp).width(16.dp))
                else Text("Delete account", color = MaterialTheme.colorScheme.onError)
            }
        }

        Spacer(Modifier.height(16.dp))
    }

    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Delete account?", color = MaterialTheme.colorScheme.error) },
            text = { Text("This will permanently delete your account and all data. This cannot be undone.") },
            confirmButton = {
                Button(
                    onClick = {
                        showDeleteDialog = false
                        viewModel.deleteAccount(onDone = onLogout)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) { Text("Yes, delete") }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) { Text("Cancel") }
            }
        )
    }
}

@Composable
private fun SettingsSection(
    index: String,
    title: String,
    isDanger: Boolean = false,
    content: @Composable () -> Unit
) {
    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "[$index]",
                    style = MaterialTheme.typography.labelSmall,
                    color = if (isDanger) MaterialTheme.colorScheme.error
                    else MaterialTheme.colorScheme.primary
                )
                Spacer(Modifier.width(8.dp))
                Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold,
                    color = if (isDanger) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface)
            }
            HorizontalDivider()
            content()
        }
    }
}

@Composable
private fun IotStatusRow(
    isLinked: Boolean,
    serialNumber: String?,
    isUnlinking: Boolean,
    onUnlink: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = if (isLinked) Icons.Default.Wifi else Icons.Default.WifiOff,
                contentDescription = null,
                tint = if (isLinked) MaterialTheme.colorScheme.primary
                else MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(Modifier.width(8.dp))
            Column {
                Text(
                    text = if (isLinked) "LINKED" else "NO DEVICE",
                    style = MaterialTheme.typography.labelSmall,
                    color = if (isLinked) MaterialTheme.colorScheme.primary
                    else MaterialTheme.colorScheme.onSurfaceVariant
                )
                if (isLinked && serialNumber != null) {
                    Text(serialNumber, style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
        if (isLinked) {
            OutlinedButton(
                onClick = onUnlink,
                enabled = !isUnlinking,
                colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error)
            ) {
                if (isUnlinking) CircularProgressIndicator(Modifier.height(14.dp).width(14.dp))
                else Text("Unlink")
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SexDropdown(selected: com.nutrisense.mobile.model.UpdateUserDto.Sex?,
                        onSelect: (com.nutrisense.mobile.model.UpdateUserDto.Sex?) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = it }) {
        OutlinedTextField(
            value = when (selected) {
                com.nutrisense.mobile.model.UpdateUserDto.Sex.MALE -> "Male"
                com.nutrisense.mobile.model.UpdateUserDto.Sex.FEMALE -> "Female"
                null -> ""
            },
            onValueChange = {},
            readOnly = true,
            label = { Text("Biological sex") },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) },
            modifier = Modifier.fillMaxWidth().menuAnchor(MenuAnchorType.PrimaryNotEditable)
        )
        ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            DropdownMenuItem(text = { Text("Male") }, onClick = {
                onSelect(UpdateUserDto.Sex.MALE); expanded = false
            })
            DropdownMenuItem(text = { Text("Female") }, onClick = {
                onSelect(UpdateUserDto.Sex.FEMALE); expanded = false
            })
            DropdownMenuItem(text = { Text("Not specified") }, onClick = {
                onSelect(null); expanded = false
            })
        }
    }
}

@Composable
private fun FeedbackChip(isSuccess: Boolean, message: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            imageVector = if (isSuccess) Icons.Default.CheckCircle else Icons.Default.Error,
            contentDescription = null,
            tint = if (isSuccess) Color(0xFF4CAF50) else MaterialTheme.colorScheme.error,
            modifier = Modifier.height(16.dp).width(16.dp)
        )
        Spacer(Modifier.width(4.dp))
        Text(
            text = message,
            style = MaterialTheme.typography.labelSmall,
            color = if (isSuccess) Color(0xFF4CAF50) else MaterialTheme.colorScheme.error
        )
    }
}
