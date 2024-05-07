import { IonButton, IonContent, IonHeader, IonPage, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import './Home.css';
import { OtplessManager, OtplessInstance } from 'otpless-ionic';
import { useState } from 'react';


const Home: React.FC = () => {

  let manager = new OtplessManager()
  const [result, setResult] = useState("Result:")
  OtplessInstance.removeAllListeners();
  OtplessInstance.addListener('OtplessResultEvent', (result: any) => {
    console.log("data in listener: " + result);
    handleResult(result);
    });

  var loaderVisibility = true;

  const openLoginPage = async() => {
    let jsonParams = {appId: "5e62zcanetd9urnxpz80"}
    const data = await manager.showOtplessLoginPage(jsonParams);
    handleResult(data);
  }

  const checkWhatsappApp = async() => {
    const hasWhatsapp = await manager.isWhatsappInstalled()
    setResult("whatsapp: " + hasWhatsapp);
  }

  const handleResult = (data: any) => {
    let message: string = JSON.stringify(data);
    console.log(message);
    setResult(message);
  };

  const toggleLoaderVisibility = async() => {
    loaderVisibility = !loaderVisibility;
    await manager.setLoaderVisibility(loaderVisibility);
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonTitle style={{ "marginTop": "16px" }}>Otpless Ionic Sample</IonTitle>
        <IonButton style={{ "marginTop": "16px" }} onClick={() => openLoginPage()}>Show Login Page</IonButton>
        <IonButton style={{ "marginTop": "16px" }} onClick={() => toggleLoaderVisibility()}>Toggle Loader Visibility</IonButton>
        <IonButton style={{ "marginTop": "16px" }} onClick={() => checkWhatsappApp()}>Check Whatsapp</IonButton>
        <IonTextarea autoGrow style={{ "marginTop": "16px" }}>{result}</IonTextarea>
      </IonContent>
    </IonPage>
  );
};

export default Home;
