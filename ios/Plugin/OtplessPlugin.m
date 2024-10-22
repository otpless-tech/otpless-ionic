#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(OtplessPlugin, "OtplessPlugin",
           CAP_PLUGIN_METHOD(showOtplessLoginPage, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(isWhatsappInstalled, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setLoaderVisibility, CAPPluginReturnPromise);
           
           CAP_PLUGIN_METHOD(setWebViewInspectable, CAPPluginReturnPromise);
           
           CAP_PLUGIN_METHOD(initHeadless, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setHeadlessCallback, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(startHeadless, CAPPluginReturnPromise);

           CAP_PLUGIN_METHOD(enableDebugLogging, CAPPluginReturnPromise);
           
           CAP_PLUGIN_METHOD(showPhoneHintLib, CAPPluginReturnPromise);
           
           CAP_PLUGIN_METHOD(attachSecureSDK, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setSimEjectionsListener, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getSimEjectionEntries, CAPPluginReturnPromise);
)
