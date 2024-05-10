package com.otpless.ionic;

import com.getcapacitor.JSObject;
import com.otpless.dto.HeadlessResponse;
import com.otpless.dto.OtplessResponse;

import org.json.JSONException;
import org.json.JSONObject;

public class Converter {

    public static JSObject fromResponseToJson(OtplessResponse response) {
        try {
            final JSONObject result = new JSONObject();
            result.put("errorMessage", response.getErrorMessage());
            result.put("data", response.getData());
            return JSObject.fromJSONObject(result);
        } catch (JSONException e) {
            final JSObject obj = new JSObject();
            String errorMessage = e.getMessage();
            if (errorMessage == null) {
                errorMessage = "Something went wrong";
            }
            obj.put("errorMessage", errorMessage);
            return obj;
        }
    }

    public static JSObject fromHeadlessResponseToJson(final HeadlessResponse headlessResponse) {
        return new JSObject()
                .put("responseType", headlessResponse.getResponseType())
                .put("statusCode", headlessResponse.getStatusCode())
                .put("response", headlessResponse.getResponse());

    }
}
