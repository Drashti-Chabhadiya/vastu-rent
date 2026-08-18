package com.vasturent.app;

import android.app.AlertDialog;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import java.security.MessageDigest;

public class MainActivity extends BridgeActivity {

    private static final String EXPECTED_PACKAGE_NAME = "com.vasturent.app";
    private static final String TAG = "AppIntegrityCheck";

    // Set to true in production once you add your release SHA-256 signature hash below
    private static final boolean STRICT_MODE = false;

    // Add your release / debug SHA-256 hashes here (without colons, uppercase)
    private static final String[] ALLOWED_SIGNATURE_HASHES = {
        // "A1B2C3D4..."
    };

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

    private String calculateSHA256(byte[] signatureBytes) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] digest = md.digest(signatureBytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }

    private void showSecurityViolationError(String message) {
        Log.e(TAG, "[SECURITY VIOLATION] " + message);
        new AlertDialog.Builder(this)
            .setTitle("Security Violation")
            .setMessage("This application has been tampered with or is an unofficial clone. App execution is blocked.")
            .setCancelable(false)
            .setPositiveButton("Exit", (dialog, which) -> finish())
            .show();
    }
}
