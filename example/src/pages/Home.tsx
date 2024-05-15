import { IonButton, IonContent, IonPage, IonTextarea, IonTitle, IonItem, IonInput } from '@ionic/react';
import './Home.css';

import {OtplessManager} from 'otpless-ionic';
import { useEffect, useState } from 'react';


const Home: React.FC = () => {

  let manager = new OtplessManager()

  useEffect(() => {
    manager.initHeadless("5E62ZCANETD9URNXPZ80")
    manager.setHeadlessCallback(onHeadlessResult)
    manager.setWebViewInspectable(true);
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

  const openLoginPage = async() => {
    let jsonParams = {appId: "5E62ZCANETD9URNXPZ80"}
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

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonTitle style={{ "marginTop": "16px" }}>Otpless Ionic Sample</IonTitle>
        <IonButton style={{ "marginTop": "16px" }} onClick={() => openLoginPage()}>Show Login Page</IonButton>
        <IonButton style={{ "marginTop": "16px" }} onClick={() => toggleLoaderVisibility()}>Toggle Loader Visibility</IonButton>
        <IonButton style={{ "marginTop": "16px" }} onClick={() => checkWhatsappApp()}>Check Whatsapp</IonButton>

        <IonItem>
          <IonInput
            value={form.phoneNumber}
            onIonChange={(e) => handleChange('phoneNumber', e.target.value)}  // Update state when text changes
            placeholder="Enter Phone or mobile"
          />
        </IonItem>

        <IonItem>
          <IonInput
            value={form.otp}
            onIonChange={(e) => handleChange('otp', e.target.value!)}  // Update state when text changes
            placeholder="Enter OTP"
          />
        </IonItem>

        <IonItem>
          <IonInput
            value={form.channelType}
            onIonChange={(e) => handleChange('channelType', e.target.value!)}  // Update state when text changes
            placeholder="Enter Channel Type"
          />
        </IonItem>

        <IonButton style={{ "marginTop": "16px" }} onClick={() => startHeadless()}>Start Headless</IonButton>

        <IonTextarea autoGrow style={{ "marginTop": "16px" }}>{form.result}</IonTextarea>
      </IonContent>
    </IonPage>
  );
};

export default Home;
