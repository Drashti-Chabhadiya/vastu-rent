#!/bin/bash

# Configuration
PROJECT_ROOT=$(pwd)
APK_DEBUG="android/app/build/outputs/apk/debug/app-debug.apk"
APK_RELEASE="android/app/build/outputs/apk/release/app-release.apk"
DEST="public/app-release.apk"

echo "🚀 Starting APK Synchronization..."

# Function to copy and verify
sync_apk() {
    local source=$1
    if [ -f "$source" ]; then
        echo "📂 Found APK at: $source"
        rm -f "$DEST" # Remove old version to avoid cache issues
        cp "$source" "$DEST"
        echo "✅ Success! File synced to $DEST"
        return 0
    else
        return 1
    fi
}

# Try Release first, then Debug
if sync_apk "$APK_RELEASE"; then
    echo "🌟 Production Release APK is now live."
elif sync_apk "$APK_DEBUG"; then
    echo "⚠️ Warning: Using Debug APK. This is NOT recommended for production."
else
    echo "❌ Error: No APK found in Android project."
    echo "💡 Tip: In Android Studio, go to Build > Build APKs."
    exit 1
fi

echo "🌐 Done. Refresh your website and test the download button."
