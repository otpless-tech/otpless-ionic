import { registerPlugin } from '@capacitor/core';

import type { OtplessPlugin } from './definitions';

const OtplessInstance = registerPlugin<OtplessPlugin>('OtplessPlugin',);

class OtplessManager {

  // to open the otpless login page
  async showOtplessLoginPage(jsonParams: any | null = null) {
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
}

export * from './definitions';
export { OtplessManager, OtplessInstance };
