import { registerPlugin } from '@capacitor/core';

import type { OtplessPlugin } from './definitions';

const OtplessInstance = registerPlugin<OtplessPlugin>('OtplessPlugin',);

interface OtplessResultCallback {
  (result: any): void;
}

class OtplessManager {
  private otplessResultEventListener: any;

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
    if (this.otplessResultEventListener) {
      this.otplessResultEventListener.remove();
    }
    this.otplessResultEventListener = OtplessInstance.addListener('OtplessResultEvent', resultCallback);
    await OtplessInstance.setHeadlessCallback();
  }

  // to start headless sdk
  async startHeadless(request: any) {
    await OtplessInstance.startHeadless({ request: request });
  }

  clearListener() {
    if (this.otplessResultEventListener) {
      this.otplessResultEventListener.remove();
      this.otplessResultEventListener = null;
    }
  }

  // Enable debug logging
  async enableDebugLogging(isEnabled: boolean) {
    await OtplessInstance.enableDebugLogging({isEnabled: isEnabled});
  }

  // show phone hint lib
  async showPhoneHintLib(showFallback: boolean) {
    const phoneHintLibResult = await OtplessInstance.showPhoneHintLib(showFallback)
    return phoneHintLibResult
  }

  async attachSecureSDK(appId: string) {
    return await OtplessInstance.attachSecureSDK({ appId });
  }
}

// Singleton class to prevent multiple listeners from being created.
class OtplessSimUtils {
  private static instance: OtplessSimUtils | null = null;
  private simStatusChangeListener: any

  private constructor() {}

  clearListeners() {
    if (this.simStatusChangeListener) {
      this.simStatusChangeListener.remove();
      this.simStatusChangeListener = null;
    }
  }

  public static getInstance(): OtplessSimUtils {
    if (this.instance === null) {
      this.instance = new OtplessSimUtils();
    }
    return this.instance;
  }

  async getSimEjectionEntries(): Promise<any[]> {
    return await OtplessInstance.getSimEjectionEntries();
  }

  async setSimEjectionsListener(isToAttach: boolean, resultCallback: OtplessResultCallback) {
    if (this.simStatusChangeListener) {
      this.simStatusChangeListener.remove();
    }
    this.simStatusChangeListener = OtplessInstance.addListener('otpless_sim_status_change_event', resultCallback);
    await OtplessInstance.setSimEjectionsListener({ isToAttach: isToAttach });
  }
}

export * from './definitions';
export { OtplessManager, OtplessInstance, OtplessSimUtils };
