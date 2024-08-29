import { IonButton, IonContent, IonPage, IonTextarea, IonTitle, IonItem, IonInput, isPlatform, IonToggle } from '@ionic/react';
import './Home.css';

import {OtplessManager} from 'otpless-ionic';
import { useEffect, useState } from 'react';


const Home: React.FC = () => {

  let manager = new OtplessManager()
  let isIosHeadlessInit = false;
  let APPID = "YOUR_APPID";

  useEffect(() => {
    if(isPlatform('android')) {
      manager.initHeadless(APPID);
      manager.setHeadlessCallback(onHeadlessResult);
      console.log("Otpless: android headless init done");
    }
    manager.setWebViewInspectable(false);
    return () => {
      manager.clearListener();
    }
  }, []);

  const[form, setForm] = useState({
    result: 'Result:',
    phoneNumber: '',
    otp: '',
    channelType: '',
  })

  const handleChange = (fieldName: string, value: any) => {
    console.log("changing: " + fieldName + " with value: " + value );
    setForm((prevForm) => ({
      ...prevForm, // Keep existing fields
      [fieldName]: value, // Update the specific field
    }));
  }

  var loaderVisibility = true;
  const [isDebugEnabled, setIsDebugEnabled] = useState(false); // Toggle state

  const openLoginPage = async() => {
    let jsonParams = {appId: APPID}
    const data = await manager.showOtplessLoginPage(jsonParams);
    handleResult(data);
  }

  const onHeadlessResult = (data: any) => {
    let message: string = JSON.stringify(data);
    console.log("============= Headless Response ==================");
    console.log(message);
    handleChange('result', message);
  }

  const checkWhatsappApp = async() => {
    const hasWhatsapp = await manager.isWhatsappInstalled()
    handleChange('result', "whatsapp: " + hasWhatsapp);
  }

  const handleResult = (data: any) => {
    let message: string = JSON.stringify(data);
    console.log(message);
    handleChange('result', message);
  };

  const toggleLoaderVisibility = async() => {
    loaderVisibility = !loaderVisibility;
    await manager.setLoaderVisibility(loaderVisibility);
  }

  const startHeadless = async () => {
    if(isPlatform('ios') && !isIosHeadlessInit) {
      manager.initHeadless(APPID);
      manager.setHeadlessCallback(onHeadlessResult);
      console.log("Otpless: ios headless init done");
      isIosHeadlessInit = true;
      return;
    }
    console.log("calling start otpless");
    let headlessRequest = {}
    let phoneNumber = form.phoneNumber;
    if (phoneNumber != null && phoneNumber.length != 0) {
      if (isNaN(Number(phoneNumber))) {
        headlessRequest = {
          "email": phoneNumber
        }
        let otp = form.otp;
        if (otp != null && otp.length != 0) {
          headlessRequest = {
            "email": phoneNumber,
            "otp": otp
          }
        }
      } else {
        headlessRequest = {
          "phone": phoneNumber,
          "countryCode": "91"
        }
        let otp = form.otp;
        if (otp != null && otp.length != 0) {
          headlessRequest = {
            "phone": phoneNumber,
            "countryCode": "91",
            "otp": otp
          }
        }
      }
    } else {
      headlessRequest = {
        "channelType": form.channelType
      }
    }
    await manager.startHeadless(headlessRequest);
  }

  const toggleDebugLogging = (isEnabled: boolean) => {
    setIsDebugEnabled(isEnabled);
    manager.enableDebugLogging(isEnabled);
  };

  return (
    <IonPage>
      <IonContent fullscreen>

        <IonItem style={{ marginTop: "50px", marginLeft: "16px", marginRight: "16px" }}>
          <IonInput
            value={form.phoneNumber}
            onIonChange={(e) => handleChange('phoneNumber', e.target.value)}
            placeholder="Enter Phone or Email"
          />
        </IonItem>

        <IonItem style={{ margin: "16px" }}>
          <IonInput
            value={form.otp}
            onIonChange={(e) => handleChange('otp', e.target.value!)}
            placeholder="Enter OTP"
          />
        </IonItem>

        <IonItem style={{ margin: "16px" }}>
          <IonInput
            value={form.channelType}
            onIonChange={(e) => handleChange('channelType', e.target.value!)}
            placeholder="Enter Channel Type"
          />
        </IonItem>

        <IonItem lines="none" style={{ margin: "16px" }}>
          <IonToggle checked={isDebugEnabled} onIonChange={(e) => toggleDebugLogging(e.detail.checked)} />
          <span style={{ marginLeft: "10px" }}>Enable Debug Logging</span>
        </IonItem>

        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <IonButton expand="block" onClick={openLoginPage}>Show Login Page</IonButton>
          <IonButton expand="block" onClick={toggleLoaderVisibility}>Toggle Loader Visibility</IonButton>
          <IonButton expand="block" onClick={checkWhatsappApp}>Check Whatsapp</IonButton>
          <IonButton expand="block" onClick={startHeadless}>Start Headless</IonButton>
        </div>

        <IonTextarea autoGrow style={{ margin: "16px" }}>{form.result}</IonTextarea>
      </IonContent>
    </IonPage>
  );
};

export default Home;
