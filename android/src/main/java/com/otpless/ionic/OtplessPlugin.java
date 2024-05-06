package com.otpless.ionic;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginHandle;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.otpless.dto.OtplessRequest;
import com.otpless.main.OtplessManager;
import com.otpless.main.OtplessView;
import com.otpless.utils.Utility;

import java.util.Iterator;

@CapacitorPlugin(name = "OtplessPlugin")
public class OtplessPlugin extends Plugin {

    private static final String TAG = OtplessPlugin.class.getSimpleName();
    private OtplessView otplessView;

    /**
     * @param activity ionic BridgeActivity dependency
     * @return boolean if back press is handled by view or not
     */
    public static boolean onBackPressed(@NonNull final BridgeActivity activity) {
        final Bridge bridge = activity.getBridge();
        if (bridge == null) return false;
        if (bridge.getPlugin("OtplessPlugin") != null) {
            final PluginHandle handle = bridge.getPlugin("OtplessPlugin");
            return ((OtplessPlugin) handle.getInstance()).onBackPressed();
        }
        return false;
    }

    @Override
    public void load() {
        checkOrInitOtpless(getActivity());
        Log.d(TAG, "otpless view loaded.");
    }

    private boolean checkOrInitOtpless(final Activity activity) {
        if (activity == null) return false;
        if (otplessView == null) {
            otplessView = OtplessManager.getInstance().getOtplessView(activity);
        }
        return true;
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        final String dat;
        if (intent != null && intent.getData() != null) {
            dat = intent.getData().toString();
        } else {
            dat = "no uri data";
        }
        Log.d(TAG, "got call in handleOnNewIntent data: " + dat);
        if (otplessView != null && otplessView.verifyIntent(intent)) return;
        super.handleOnNewIntent(intent);
    }

    /**
     * checks if whatsapp is installed or not and send the result in promise object
     * as hasWhatsapp
     *
     * @param call holder for promised object and other info
     */
    @PluginMethod
    public void isWhatsappInstalled(PluginCall call) {
        Boolean isInstalled = false;
        if (getActivity() != null) {
            isInstalled = Utility.isWhatsAppInstalled(getActivity());
        }
        final JSObject jsObject = new JSObject();
        jsObject.put("hasWhatsapp", isInstalled);
        call.resolve(jsObject);
    }

    /**
     * Shows otpless login page
     *
     * @param call having additional jsonParams info and promise object
     */
    @PluginMethod
    public void showOtplessLoginPage(PluginCall call) {
        if (!checkOrInitOtpless(getActivity())) return;
        final JSObject obj = call.getObject("jsonParams");
        final String appId = obj.optString("appId", "");
        final OtplessRequest request = new OtplessRequest(appId);
        // setting uxmode and locale
        final String uxmode = obj.getString("uxmode");
        if (uxmode != null) {
            request.setUxmode(uxmode);
        }
        final String locale = obj.getString("locale");
        if (locale != null) {
            request.setLocale(locale);
        }
        final JSObject params = obj.getJSObject("params");
        if (params != null) {
            for (Iterator<String> it = params.keys(); it.hasNext(); ) {
                String key = it.next();
                final String value = params.getString(key);
                if (value == null) continue;
                request.addExtras(key, value);

            }
        }
        onMainThread(() ->
                otplessView.showOtplessLoginPage(request,
                        otplessUserDetail -> call.resolve(Converter.fromResponseToJson(otplessUserDetail))
                )
        );
    }

    /**
     * to change the visibility of native loader
     *
     * @param call having visibility flag
     */
    @PluginMethod
    public void setLoaderVisibility(PluginCall call) {
        if (checkOrInitOtpless(getActivity())) {
            Boolean visibility = call.getBoolean("visibility", true);
            if (visibility == null) {
                visibility = true;
            }
            otplessView.setLoaderVisibility(visibility);
        }
        call.resolve();
    }

    boolean onBackPressed() {
        if (otplessView == null) return false;
        return otplessView.onBackPressed();
    }

    private void onMainThread(final Runnable callback) {
        if (getActivity() == null) return;
        getActivity().runOnUiThread(callback);
    }
}
