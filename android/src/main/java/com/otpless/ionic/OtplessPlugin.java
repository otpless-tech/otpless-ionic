package com.otpless.ionic;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginHandle;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.otpless.dto.HeadlessRequest;
import com.otpless.dto.HeadlessResponse;
import com.otpless.dto.OtpDeliveryChannel;
import com.otpless.dto.OtpLength;
import com.otpless.dto.OtplessRequest;
import com.otpless.main.OtplessManager;
import com.otpless.main.OtplessView;
import com.otpless.tesseract.OtplessSecureService;
import com.otpless.tesseract.SimStateEntry;
import com.otpless.tesseract.sim.OtplessSimStateReceiverApi;
import com.otpless.utils.Utility;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Iterator;
import java.util.List;

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

    /**
     * Handles the onActivityResult callback for the OtplessPlugin.
     * @param activity The Ionic BridgeActivity dependency.
     * @param requestCode The request code that was used to start the activity.
     * @param resultCode The result code returned by the child activity.
     * @param data An Intent containing the result data returned by the child activity.
     * @return boolean Returns true if the requestCode matches one of the Otpless' request codes, otherwise false.
     */
    public static boolean onActivityResult(BridgeActivity activity, int requestCode, int resultCode, Intent data) {
        final Bridge bridge = activity.getBridge();
        if (bridge == null) return false;
        if (bridge.getPlugin("OtplessPlugin") != null) {
            final PluginHandle handle = bridge.getPlugin("OtplessPlugin");
            return ((OtplessPlugin) handle.getInstance()).otplessView.onActivityResult(requestCode, resultCode, data);
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
            otplessView.getPhoneHintManager().register(activity, false);
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
        if (otplessView != null && otplessView.onNewIntent(intent)) return;
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
        if (!checkOrInitOtpless(getActivity())) {
            call.resolve();
            return;
        }
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

    @PluginMethod
    public void setWebViewInspectable(PluginCall call) {
        call.resolve();
    }

    @PluginMethod
    public void initHeadless(PluginCall call) {
        if (!checkOrInitOtpless(getActivity())) {
            call.resolve();
            return;
        }
        String appId = call.getString("appId", "");
        onMainThread(() -> {
            otplessView.initHeadless(appId);
        });
        call.resolve();
    }

    @PluginMethod
    public void setHeadlessCallback(PluginCall call) {
        if (!checkOrInitOtpless(getActivity())) {
            call.resolve();
            return;
        }
        otplessView.setHeadlessCallback(this::onHeadlessResponse);
        call.resolve();
    }

    @PluginMethod
    public void startHeadless(PluginCall call) throws Exception {
        if (!checkOrInitOtpless(getActivity())) {
            call.resolve();
            return;
        }
        // creating headless request
        final JSObject jsRequest = call.getObject("request");
        if (jsRequest == null) throw new Exception("Headless request is missing");
        onMainThread(() -> {
            otplessView.startHeadless(makeHeadlessRequest(jsRequest), this::onHeadlessResponse);
        });
        call.resolve();
    }

    /**
     * Enables/Disables debug logging in Android and iOS using the provided boolean value.
     *
     * @param call having additional jsonParams info and promise object
     */
    @PluginMethod
    public void enableDebugLogging(PluginCall call) {
        Boolean isEnabled = call.getBoolean("isEnabled", true);
        isEnabled = isEnabled == null || isEnabled;
        Utility.debugLogging = isEnabled;
        call.resolve();
    }

    @PluginMethod
    public void showPhoneHintLib(PluginCall call) {
        Boolean showFallback = call.getBoolean("showFallback", true);
        otplessView.getPhoneHintManager().showPhoneNumberHint(Boolean.TRUE.equals(showFallback), response -> {
            JSObject object = new JSObject();
            if (response.getSecond() != null) {
                String error = response.getSecond().getMessage() != null ? response.getSecond().getMessage() : "Unable to get phone number.";
                object.put("error", error);
            } else {
                object.put("phoneNumber", response.getFirst());
            }

            call.resolve(object);
            return null;
        });
    }

    @PluginMethod
    public void attachSecureSDK(PluginCall call) {
        String appId = call.getString("appId", "");
        try {
            Class<?> managerClass = Class.forName("com.otpless.secure.OtplessSecureManager");
            Object managerInstance = managerClass.getField("INSTANCE").get(null);
            Method creatorMethod = managerClass.getDeclaredMethod("getOtplessSecureService", Activity.class, String.class);
            OtplessSecureService secureService = (OtplessSecureService) creatorMethod.invoke(managerInstance, getActivity(), appId);
            otplessView.attachOtplessSecureService(secureService);
            call.resolve();
        } catch (ClassNotFoundException | NoSuchMethodException | IllegalAccessException | InvocationTargetException | NoSuchFieldException ex) {
            Utility.debugLog(ex);
            call.reject("Failed to create otpless service.", "SERVICE_ERROR", ex);
        }
    }

    @PluginMethod
    public void setSimEjectionsListener(PluginCall call) {
        boolean isToAttach = Boolean.TRUE.equals(call.getBoolean("isToAttach", false));
        if (isToAttach) {
            JSObject result = new JSObject();
            OtplessSimStateReceiverApi.INSTANCE.setSimStateChangeListener(simStateEntries -> {
                JSArray resultArray = new JSArray();
                for (SimStateEntry entry : simStateEntries) {
                    JSObject simInfo = new JSObject();
                    simInfo.put("state", entry.getState());
                    simInfo.put("transactionTime", entry.getTransactionTime());
                    resultArray.put(simInfo);
                }
                result.put("entries", resultArray);
                notifyListeners("otpless_sim_status_change_event", result);
                return null;
            });
            call.resolve();
        } else {
            OtplessSimStateReceiverApi.INSTANCE.setSimStateChangeListener(null);
            call.resolve();
        }
    }

    @PluginMethod
    public void getSimEjectionEntries(PluginCall call) {
        JSObject result = new JSObject();
        try {
            List<SimStateEntry> simEntries = OtplessSimStateReceiverApi.INSTANCE.savedEjectedSimEntries(getContext());
            JSArray entriesArray = new JSArray();
            for (SimStateEntry entry : simEntries) {
                JSObject simInfo = new JSObject();
                simInfo.put("state", entry.getState());
                simInfo.put("transactionTime", entry.getTransactionTime());
                entriesArray.put(simInfo);
            }
            result.put("entries", entriesArray);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to get ejected SIM entries", "SIM_ERROR", e);
        }
    }

    private HeadlessRequest makeHeadlessRequest(final JSObject jsRequest) {
        final HeadlessRequest headlessRequest = new HeadlessRequest();
        final String phone = jsRequest.optString("phone", "");
        // first check for phone number case
        if (!phone.isEmpty()) {
            final String countryCode = jsRequest.optString("countryCode", "");
            headlessRequest.setPhoneNumber(countryCode, phone);
            final String otp = jsRequest.optString("otp", "");
            // check otp with phone number
            if (!otp.isEmpty()) {
                headlessRequest.setOtp(otp);
            }
        } else {
            // check for email case
            final String email = jsRequest.optString("email", "");
            if (!email.isEmpty()) {
                headlessRequest.setEmail(email);
                final String otp = jsRequest.optString("otp", "");
                // check otp with email
                if (!otp.isEmpty()) {
                    headlessRequest.setOtp(otp);
                }
            } else {
                // last case is oauth case
                final String channelType = jsRequest.optString("channelType", "");
                headlessRequest.setChannelType(channelType);
            }
        }
        final int otpLength = jsRequest.optInt("otpLength", -1);
        final int expiry = jsRequest.optInt("expiry", -1);
        final String deliveryChannel = jsRequest.optString("deliveryChannel", "");

        if (!deliveryChannel.isBlank()) {
            headlessRequest.setDeliveryChannel(OtpDeliveryChannel.from(deliveryChannel.toUpperCase()));
        }
        if (otpLength != -1) {
            headlessRequest.setOtpLength(OtpLength.suggestOtpSize(otpLength));
        }
        if (expiry != -1) {
            headlessRequest.setExpiry(expiry);
        }
        return headlessRequest;
    }

    private void onMainThread(final Runnable callback) {
        if (getActivity() == null) return;
        getActivity().runOnUiThread(callback);
    }

    private void onHeadlessResponse(@NonNull HeadlessResponse headlessResponse) {
        notifyListeners("OtplessResultEvent", Converter.fromHeadlessResponseToJson(headlessResponse));
    }
}
