#!/usr/bin/env bash
# android-run.sh — start emulator and install APK reliably
set -e

EMULATOR="/opt/android-sdk/emulator/emulator"
AVD="Pixel_8_API_34"
GRADLEW="$(dirname "$0")/../gradlew"

echo "▶ Resetting ADB server..."
adb kill-server
adb start-server

echo "▶ Starting emulator: $AVD"
"$EMULATOR" -avd "$AVD" -wipe-data -no-boot-anim -no-audio &
EMULATOR_PID=$!

echo "▶ Waiting for emulator to register with ADB..."
sleep 6
adb wait-for-device

echo "▶ Waiting for Android OS to finish booting (sys.boot_completed=1)..."
until adb shell getprop sys.boot_completed 2>/dev/null | grep -q "^1$"; do
  sleep 2
done

echo "▶ Boot complete! Installing APK..."
cd "$(dirname "$0")/.."
./gradlew installDebug

echo "✅ NutriSense installed successfully!"
