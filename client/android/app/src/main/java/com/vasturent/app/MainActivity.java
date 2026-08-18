package com.vasturent.app;

import android.app.AlertDialog;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.os.Build;
import android.os.Bundle;
import android.text.InputType;
import android.util.Log;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;
import java.security.MessageDigest;

public class MainActivity extends BridgeActivity {

    private static final String EXPECTED_PACKAGE_NAME = "com.vasturent.app";
    private static final String TAG = "AppIntegrityCheck";

    // Set to true to enforce strict SHA-256 signature verification in production/builds
    private static final boolean STRICT_MODE = true;

    // Allowed SHA-256 signing key certificate fingerprints (without colons, uppercase)
    private static final String[] ALLOWED_SIGNATURE_HASHES = {
        "7E3C5B6A889AB2B2BB409C8ADFFFEBEF996F65D4EEB8B82821B439DF1BA9CBF7",
    };

    // SHA-256 hash of Master Developer Passcode ("VastuAdmin#2026")
    private static final String MASTER_PASSCODE_HASH =
        "9B5DF1807D9B9A67A0A09E0783424AD47DF83C9CD022D4F291079D863BF02542";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        verifyAppIntegrity();
    }

    private void verifyAppIntegrity() {
        // 1. Verify Package Name
        String currentPackageName = getPackageName();
        if (!EXPECTED_PACKAGE_NAME.equals(currentPackageName)) {
            showSecurityViolationError(
                "Package Name Mismatch! Expected " + EXPECTED_PACKAGE_NAME + " but found " + currentPackageName
            );
            return;
        }

        // 2. Verify Signing Certificate Hash
        try {
            String currentHash = getAppSignatureHash();
            Log.d(TAG, "[INTEGRITY CHECK] Current App Signature SHA-256: " + currentHash);

            if (STRICT_MODE && ALLOWED_SIGNATURE_HASHES.length > 0) {
                boolean isMatch = false;
                for (String allowedHash : ALLOWED_SIGNATURE_HASHES) {
                    if (allowedHash.equalsIgnoreCase(currentHash)) {
                        isMatch = true;
                        break;
                    }
                }
                if (!isMatch) {
                    showSecurityViolationError(
                        "Signing Certificate Verification Failed! App signature does not match original key."
                    );
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error calculating app signature hash", e);
        }
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

    private void showSecurityViolationError(String message) {
        Log.e(TAG, "[SECURITY VIOLATION] " + message);

        final EditText input = new EditText(this);
        input.setHint("Enter Master Passcode");
        input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);

        LinearLayout container = new LinearLayout(this);
        container.setOrientation(LinearLayout.VERTICAL);
        int padding = (int) (16 * getResources().getDisplayMetrics().density);
        container.setPadding(padding, padding, padding, padding);
        container.addView(input);

        new AlertDialog.Builder(this)
            .setTitle("🔒 Security Verification Required")
            .setMessage("Unofficial or modified APK detected. Enter Master Activation Passcode to unlock execution:")
            .setView(container)
            .setCancelable(false)
            .setPositiveButton("Unlock", (dialog, which) -> {
                String passcode = input.getText().toString().trim();
                try {
                    String enteredHash = calculateSHA256(passcode.getBytes("UTF-8"));
                    if (MASTER_PASSCODE_HASH.equalsIgnoreCase(enteredHash)) {
                        Toast.makeText(this, "Master Passcode Verified. Access Granted.", Toast.LENGTH_SHORT).show();
                        Log.i(TAG, "Master Passcode Verified successfully.");
                    } else {
                        Toast.makeText(this, "Invalid Security Passcode! Access Denied.", Toast.LENGTH_LONG).show();
                        finish();
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error hashing passcode", e);
                    finish();
                }
            })
            .setNegativeButton("Exit", (dialog, which) -> finish())
            .show();
    }
}
