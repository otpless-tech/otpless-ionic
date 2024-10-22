import { Plugin } from "@capacitor/core"

export interface OtplessPlugin extends Plugin {
  // to open the optless login page
  showOtplessLoginPage(option: { jsonParams: any }): Promise<any>;
  // check if whatsapp is installed or not
  isWhatsappInstalled(): Promise<{ hasWhatsapp: string }>;
  // setting visibility of native loader
  setLoaderVisibility(option: {visibility: boolean}): Promise<void>;
  // to enable and disble the webview inspection
  setWebViewInspectable(option: {isInspectable: boolean}): Promise<void>;
  // to enable and disable onetap option
  enableOneTap(option: {isOnetap: boolean}): Promise<void>;

  // to initialize headless
  initHeadless(option: {appId: String}): Promise<void>;
  // to set headless callback
  setHeadlessCallback(): Promise<void>;
  // to start headless sdk
  startHeadless(option: {request: any}): Promise<void>;

  //enable debug logging
  enableDebugLogging(option: {isEnabled: boolean}): Promise<void>;

  // show phone hint lib
  showPhoneHintLib(showFallback: boolean): Promise<{ [key: string]: string }>;

  // attach secure sdk
  attachSecureSDK(option: { appId: string }): Promise<void>;

  // set sim ejection listener
  setSimEjectionsListener(option: { isToAttach: boolean }): Promise<void>

  // get saved sim card entries
  getSimEjectionEntries(): Promise<any[]>
}
