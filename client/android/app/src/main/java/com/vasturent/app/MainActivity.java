package com.vasturent.app;

import android.app.AlertDialog;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.os.Build;
import android.os.Bundle;
import android.os.Process;
import android.text.InputType;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;
import java.security.MessageDigest;

public class MainActivity extends BridgeActivity {

    private static final String EXPECTED_PACKAGE_NAME = "com.vasturent.app";
    private static final String TAG = "AppIntegrityCheck";

    // Enforce strict SHA-256 signature verification in production/builds
    private static final boolean STRICT_MODE = true;

    // Allowed SHA-256 signing key certificate fingerprints (without colons, uppercase)
    private static final String[] ALLOWED_SIGNATURE_HASHES = {
        "7E3C5B6A889AB2B2BB409C8ADFFFEBEF996F65D4EEB8B82821B439DF1BA9CBF7",
    };

    // SHA-256 hash of Master Developer Passcode ("VastuAdmin#2026")
    private static final String MASTER_PASSCODE_HASH =
        "9B5DF1807D9B9A67A0A09E0783424AD47DF83C9CD022D4F291079D863BF02542";

    private boolean isSecurityVerified = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        performMultiLayerSecurityCheck();
    }

    @Override
    public void onResume() {
        super.onResume();
        // Secondary re-verification to prevent Smali bypass of onCreate
        if (!isSecurityVerified) {
            performMultiLayerSecurityCheck();
        }
    }

    private void performMultiLayerSecurityCheck() {
        // 1. Detect Debugger / Hooking Tools
        if (isBeingDebugged() || isTestKeysBuild()) {
            Log.w(TAG, "Debugger or untrusted environment detected.");
        }

        // 2. Verify Package Name (Anti-Rebranding)
        String currentPackageName = getPackageName();
        if (!EXPECTED_PACKAGE_NAME.equals(currentPackageName)) {
            triggerHardSecurityLock("Package Name Tampered! Expected: " + EXPECTED_PACKAGE_NAME + " | Found: " + currentPackageName);
            return;
        }

        // 3. Verify Hardware SHA-256 Signing Certificate
        try {
            String currentHash = getAppSignatureHash();
            Log.d(TAG, "[INTEGRITY CHECK] Current Signature: " + currentHash);

            if (STRICT_MODE && ALLOWED_SIGNATURE_HASHES.length > 0) {
                boolean isMatch = false;
                for (String allowedHash : ALLOWED_SIGNATURE_HASHES) {
                    if (allowedHash.equalsIgnoreCase(currentHash)) {
                        isMatch = true;
                        break;
                    }
                }
                if (!isMatch) {
                    triggerHardSecurityLock("Tampered / Unofficial APK Detected! Certificate fingerprint mismatch.");
                    return;
                }
            }
            isSecurityVerified = true;
        } catch (Exception e) {
            Log.e(TAG, "Failed to inspect app signature", e);
            terminateAppProcess();
        }
    }

    private void triggerHardSecurityLock(String violationDetails) {
        isSecurityVerified = false;
        Log.e(TAG, "[CRITICAL SECURITY VIOLATION] " + violationDetails);

        // Immediately hide/blank out app view so no WebView or background code runs
        setContentView(new View(this));

        final EditText input = new EditText(this);
        input.setHint("Enter Master Passcode");
        input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);

        LinearLayout container = new LinearLayout(this);
        container.setOrientation(LinearLayout.VERTICAL);
        int padding = (int) (20 * getResources().getDisplayMetrics().density);
        container.setPadding(padding, padding, padding, padding);
        container.addView(input);

        new AlertDialog.Builder(this)
            .setTitle("🔒 Security Verification Required")
            .setMessage("Unofficial APK modification detected.\n\nEnter Master Activation Passcode to unlock execution:")
            .setView(container)
            .setCancelable(false)
            .setPositiveButton("Unlock", (dialog, which) -> {
                String passcode = input.getText().toString().trim();
                try {
                    String enteredHash = calculateSHA256(passcode.getBytes("UTF-8"));
                    if (MASTER_PASSCODE_HASH.equalsIgnoreCase(enteredHash)) {
                        isSecurityVerified = true;
                        Toast.makeText(this, "Master Passcode Verified. Launching...", Toast.LENGTH_SHORT).show();
                        recreate();
                    } else {
                        Toast.makeText(this, "Invalid Security Passcode! Access Denied.", Toast.LENGTH_LONG).show();
                        terminateAppProcess();
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error hashing passcode", e);
                    terminateAppProcess();
                }
            })
            .setNegativeButton("Exit", (dialog, which) -> terminateAppProcess())
            .show();
    }

    private void terminateAppProcess() {
        finishAffinity();
        Process.killProcess(Process.myPid());
        System.exit(0);
    }

    private boolean isBeingDebugged() {
        return android.os.Debug.isDebuggerConnected() || (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
    }

    private boolean isTestKeysBuild() {
        String buildTags = Build.TAGS;
        return buildTags != null && buildTags.contains("test-keys");
    }

    private String getAppSignatureHash() throws Exception {
        PackageInfo packageInfo;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            packageInfo = getPackageManager().getPackageInfo(getPackageName(), PackageManager.GET_SIGNING_CERTIFICATES);
            Signature[] signatures = packageInfo.signingInfo.getApkContentsSigners();
            return calculateSHA256(signatures[0].toByteArray());
        } else {
            packageInfo = getPackageManager().getPackageInfo(getPackageName(), PackageManager.GET_SIGNATURES);
            return calculateSHA256(packageInfo.signatures[0].toByteArray());
        }
    }

    private String calculateSHA256(byte[] bytes) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] digest = md.digest(bytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }
}
