import Foundation
import Capacitor

import OtplessSDK

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(OtplessPlugin)
public class OtplessPlugin: CAPPlugin, onHeadlessResponseDelegate {
   
    private var pluginCallWrap: CapPluginCallWrapper? = nil
    
    @objc func showOtplessLoginPage(_ call: CAPPluginCall) {
        let jsObject: JSObject = call.getObject("jsonParams")!
        let appId = jsObject["appId"] as! String
        let params = jsObject["params"] as? JSObject
        DispatchQueue.main.async {
            let viewController = UIApplication.shared.delegate?.window??.rootViewController
            self.pluginCallWrap = CapPluginCallWrapper(pluginCall: call)
            Otpless.sharedInstance.delegate = self.pluginCallWrap!
            Otpless.sharedInstance.showOtplessLoginPageWithParams(appId: appId, vc: viewController!, params: params)
        }
    }
    
    @objc func isWhatsappInstalled(_ call: CAPPluginCall) {
        let hasWhatsapp = Otpless.sharedInstance.isWhatsappInstalled()
        var result: JSObject = JSObject()
        result["hasWhatsapp"] = hasWhatsapp
        call.resolve(result)
    }
    
    @objc func setLoaderVisibility(_ call: CAPPluginCall) {
        // to be implemented
    }
    
    @objc func setWebViewInspectable(_ call: CAPPluginCall) {
        let isInspectable = call.getBool("isInspectable", false)
        Otpless.sharedInstance.webviewInspectable = isInspectable
        call.resolve()
    }
    
    @objc func initHeadless(_ call: CAPPluginCall) {
        let appId = call.getString("appId", "")
        DispatchQueue.main.async {
            let viewController = UIApplication.shared.delegate?.window??.rootViewController
            Otpless.sharedInstance.initialise(vc: viewController!, appId: appId)
        }
    }
    
    @objc func setHeadlessCallback(_ call: CAPPluginCall) {
        Otpless.sharedInstance.headlessDelegate = self
    }
    
    @objc func startHeadless(_ call: CAPPluginCall) {
        let jsRequest: JSObject = call.getObject("request")!
        let headlessRequest = makeHeadlessRequest(jsRequest: jsRequest)
        DispatchQueue.main.async {
            if let otp = jsRequest["otp"] {
                Otpless.sharedInstance.verifyOTP(otp: otp as! String, headlessRequest: headlessRequest)
            } else {
                Otpless.sharedInstance.startHeadless(headlessRequest: headlessRequest)
            }
        }
    }
    
    /**
     Enables/Disables debug logging in Android and iOS using the provided boolean value.
     - parameter call call having additional jsonParams info and promise object
     */
    @objc func enableDebugLogging(_ call: CAPPluginCall) {
        let isEnabled = call.getBool("isEnabled", false)

        if isEnabled {
            Otpless.sharedInstance.setLoggerDelegate(delegate: self)
        }
    }
    
    @objc public func showPhoneHintLib(_ call: CAPPluginCall) {
        var result: JSObject = JSObject()
        result["error"] = "Phone hint lib does not work on iOS."
        call.resolve(result)
    }

    private func makeHeadlessRequest(jsRequest: JSObject) -> HeadlessRequest {
        let headlessRequest = HeadlessRequest()
        if let phone = jsRequest["phone"] {
            let countryCode = jsRequest["countryCode"]
            headlessRequest.setPhoneNumber(number: phone as! String, withCountryCode: countryCode as! String)
        } else if let email = jsRequest["email"] {
            headlessRequest.setEmail(email as! String)
        } else {
            headlessRequest.setChannelType(jsRequest["channelType"] as! String)
        }
        return headlessRequest;
    }
    
    public func onHeadlessResponse(response: OtplessSDK.HeadlessResponse?) {
        if response == nil {
            return
        }
        var result: JSObject = JSObject()
        result["statusCode"] = response!.statusCode
        result["responseType"] = response!.responseType
        if let data = response!.responseData {
            result["response"] = anyDictToJsObjDict(input: data)
        }
        notifyListeners("OtplessResultEvent", data: result)
    }
    
}

extension OtplessPlugin: OtplessLoggerDelegate {
    public func otplessLog(string: String, type: String) {
        print("Otpless Log of type : \(type)\n\n\(string)")
    }
}

class CapPluginCallWrapper: onResponseDelegate {
    
    private let pluginCall: CAPPluginCall
    private var isCallUsed = false
    
    init(pluginCall: CAPPluginCall) {
        self.pluginCall = pluginCall
    }
    
    func onResponse(response: OtplessResponse?) {
        if isCallUsed {
            return
        }
        var result: JSObject = JSObject()
        result["errorMessage"] = response?.errorString
        if let data = response?.responseData {
            result["data"] = anyDictToJsObjDict(input: data)
        }
        pluginCall.resolve(result)
        isCallUsed = true
    }
}


private func anyDictToJsObjDict(input: [String: Any]) -> [String: JSValue] {
    var result: JSObject = JSObject()
    for (key, value) in input {
        if (value as? String) != nil {
            result[key] = value as! String
        } else if (value as? Bool) != nil {
            result[key] = value as! Bool
        } else if (value as? Int) != nil {
            result[key] = value as! Int
        } else if (value as? Float) != nil {
            result[key] = value as! Float
        } else if (value as? Double) != nil {
            result[key] = value as! Double
        } else if (value as? [Any]) != nil {
            result[key] = anyArrayToJsObjArray(input: value as! [Any])
        } else if (value as? [String: Any]) != nil {
            result[key] = anyDictToJsObjDict(input: value as! [String: Any])
        }
    }
    return result
}

private func anyArrayToJsObjArray(input: [Any]) -> [JSValue] {
    var result: [JSValue] = []
    for value in input {
        if (value as? String) != nil {
            result.append(value as! String)
        } else if (value as? Bool) != nil {
            result.append(value as! Bool)
        } else if (value as? Int) != nil {
            result.append(value as! Int)
        } else if (value as? Float) != nil {
            result.append(value as! Float)
        } else if (value as? Double) != nil {
            result.append(value as! Double)
        } else if (value as? [Any]) != nil {
            result.append(anyArrayToJsObjArray(input: value as! [Any]))
        } else if (value as? [String: Any]) != nil {
            result.append(anyDictToJsObjDict(input: value as! [String: Any]))
        }
    }
    return result
}
