# Aggressive R8 / ProGuard Obfuscation Rules for Vastu Rent Mobile APK
# Hinders decompilation tools (apktool, JADX, Bytecode Viewers)

# Obfuscate all non-public classes and repackage into root
-repackageclasses ''
-allowaccessmodification

# Remove debugging logs, line numbers, and original source attributes
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
    public static int i(...);
}

# Preserve Capacitor Bridge & Native Plugin interfaces
-keep public class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.BridgeActivity
-keep public class * extends com.getcapacitor.Plugin

# Obfuscate internal MainActivity fields and security methods
-keepclassmembers class com.vasturent.app.MainActivity {
    protected void onCreate(android.os.Bundle);
}
