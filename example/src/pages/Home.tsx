import { IonButton, IonContent, IonPage, IonTextarea, IonTitle, IonItem, IonInput, isPlatform, IonHeader, IonToolbar } from '@ionic/react';
import './Home.css';
import {OtplessManager, OtplessSimUtils} from 'otpless-ionic';
// import { OtplessManager, OtplessSimUtils } from '../../../src/'
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

export const APPID = "YOUR_APPID";

const Home: React.FC = () => {
  useEffect(() => {
    manager.setWebViewInspectable(true);
    attachSecureSDK()
    setSimEjectionListener()

    return () => {
      manager.clearListener()
      otplessSimUtils.clearListeners()
    }
  }, [])

  const attachSecureSDK = async () => {
    try {
      await manager.attachSecureSDK(APPID);
      alert('Secure SDK attached successfully.');
    } catch (error) {
      alert('Failed to attach Secure SDK:' + error);
    }
  }

  const setSimEjectionListener = async () => {
    try {
      otplessSimUtils.setSimEjectionsListener(true, (data: any) => {
        setSimStates(JSON.stringify(data.entries))
      })
    } catch (error) {
      alert(error)
    }
  }

  const getSimEjectionEntries = async () => {
    try {
      const response = await otplessSimUtils.getSimEjectionEntries()
      setSimStates(JSON.stringify(response.entries))
    } catch (error) {
      console.error(error)
      alert(error)
    }
  }

  const history = useHistory();
  let manager = new OtplessManager();
  let otplessSimUtils = OtplessSimUtils.getInstance();
  const [response, setResponse] = useState("Result:");
  const [simStates, setSimStates] = useState('');

  const openLoginPage = async () => {
    let jsonParams = { appId: APPID };
    const data = await manager.showOtplessLoginPage(jsonParams);
    setResponse(JSON.stringify(data));
  };

  const copyResponse = async () => {
    navigator.clipboard.writeText(response);
    alert("Response copied to clipboard!");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Otpless Example</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <IonButton expand="block" onClick={openLoginPage}>Show Login Page</IonButton>
          <IonButton expand="block" onClick={() => history.push("/start-headless")}>Go to Start Headless</IonButton>
          <IonButton expand="block" onClick={() => getSimEjectionEntries()}>Get sim ejection entries</IonButton>
          <IonTextarea autoGrow style={{ margin: "16px" }} value={response} readonly></IonTextarea>
        </div>

        <IonButton expand="block" onClick={copyResponse}>Copy Response</IonButton>
        <IonTextarea autoGrow style={{ margin: "16px" }} value={simStates} readonly></IonTextarea>

      </IonContent>
    </IonPage>
  );
};

export default Home;
