import { Plugin } from "@capacitor/core"

export interface OtplessPlugin extends Plugin {
  // to open the optless login page
  showOtplessLoginPage(option: { jsonParams: any }): Promise<any>;
  // check if whatsapp is installed or not
  isWhatsappInstalled(): Promise<{ hasWhatsapp: string }>;
  // setting visibility of native loader
  setLoaderVisibility(option: {visibility: boolean}): Promise<void>;
}