import Foundation
import Capacitor

import OtplessSDK

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(OtplessPlugin)
public class OtplessPlugin: CAPPlugin, onResponseDelegate {
    
    private var pluginCallWrap: CapPluginCallWrapper? = nil
    
    
    public func onResponse(response: OtplessResponse?) {
        var result: JSObject = JSObject()
        result["errorMessage"] = response?.errorString
        if let data = response?.responseData {
            result["data"] = anyDictToJsObjDict(input: data)
        }
        notifyListeners("OtplessResultEvent", data: result)
    }
    
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
