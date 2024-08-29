import { registerPlugin } from '@capacitor/core';

import type { OtplessPlugin } from './definitions';

const OtplessInstance = registerPlugin<OtplessPlugin>('OtplessPlugin',);

interface OtplessResultCallback {
  (result: any): void;
}

class OtplessManager {

  // to open the otpless login page
  async showOtplessLoginPage(jsonParams: any) {
    return await OtplessInstance.showOtplessLoginPage({ "jsonParams": jsonParams });
  }

  // to check if whatsapp is installed or not
  async isWhatsappInstalled() {
    const {hasWhatsapp} = await OtplessInstance.isWhatsappInstalled();
    return hasWhatsapp;
  }

  // set visibility of native loader
  async setLoaderVisibility(visibility: boolean) {
    await OtplessInstance.setLoaderVisibility({ visibility: visibility });
  }

  // to enable and disble the webview inspection
  async setWebViewInspectable(isInspectable: boolean) {
    await OtplessInstance.setWebViewInspectable({ isInspectable: isInspectable });
  }

  // to enable and disable onetap option
  async enableOneTap(isOnetap: boolean) {
    await OtplessInstance.enableOneTap({ isOnetap: isOnetap });
  }

  // to initialize headless
  async initHeadless(appId: String) {
    await OtplessInstance.initHeadless({ appId: appId })
  }

  // to set headless callback
  async setHeadlessCallback(resultCallback: OtplessResultCallback) {
    OtplessInstance.removeAllListeners();
    OtplessInstance.addListener('OtplessResultEvent', resultCallback);
    await OtplessInstance.setHeadlessCallback();
  }

  // to start headless sdk
  async startHeadless(request: any) {
    await OtplessInstance.startHeadless({ request: request });
  }

  clearListener() {
    OtplessInstance.removeAllListeners();
  }

  // Enable debug logging
  async enableDebugLogging(isEnabled: boolean) {
    await OtplessInstance.enableDebugLogging({isEnabled: isEnabled});
  }
}

export * from './definitions';
export { OtplessManager, OtplessInstance };
