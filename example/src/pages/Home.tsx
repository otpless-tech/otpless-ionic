import { IonButton, IonContent, IonPage, IonTextarea, IonTitle, IonItem, IonInput, isPlatform, IonHeader, IonToolbar } from '@ionic/react';
import './Home.css';
import {OtplessManager} from 'otpless-ionic';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

export const APPID = "YOUR_APPID";

const Home: React.FC = () => {
  useEffect(() => {
    manager.setWebViewInspectable(true);
  }, [])

  const history = useHistory();
  let manager = new OtplessManager();
  const [response, setResponse] = useState("Result:");

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
        </div>

        <IonButton expand="block" onClick={copyResponse}>Copy Response</IonButton>
        <IonTextarea autoGrow style={{ margin: "16px" }} value={response} readonly></IonTextarea>

      </IonContent>
    </IonPage>
  );
};

export default Home;
