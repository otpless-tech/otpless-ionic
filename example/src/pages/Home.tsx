import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
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

  const openWithCallback = async () => {
    let params = {
      'method': 'get',
      'params': {
        'ux_mode': 'auto_clicked'
      }
    };
    const data = await manager.startWithCallback(params);
    handleResult(data);
  }

  const openLoginPage = async() => {
    let params = {
      'method': 'get',
      'params': {
        'name': 'otplesstext'
      }
    };
    const data = await manager.showOtplessLoginPage(params);
    handleResult(data);
  }

  const checkWhatsappApp = async() => {
    const hasWhatsapp = await manager.isWhatsappInstalled()
    setResult("whatsapp: " + hasWhatsapp);
  }

  const openWithEvent = async () => {
    let params = {
      'method': 'get',
      'params': {
        'isSpecialClient': 'true'
      }
    };
    manager.start(params);
  }

  const afterSigninCompleted = async () => {
    await manager.onSignInCompleted();
  }

  const hideSignInButton = async () => {
    await manager.showFabButton(false);
  }

  const handleResult = (data: any) => {
    let message: string = '';
    if (data.data === null || data.data === undefined) {
      message = data.errorMessage;
    } else {
      message = `token: ${data.data.token}`;
    }
    setResult(message);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Otpless IONIC Sample</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonTitle style={{ "marginTop": "16px" }}>{result}</IonTitle>

        <IonButton onClick={() => openWithEvent()}>Open With Event</IonButton>
        <IonButton onClick={() => openWithCallback()}>Open With Callback</IonButton>
        <IonButton style={{ "marginTop": "16px" }} onClick={() => afterSigninCompleted()}>After SignIn Completed</IonButton>
        <IonButton style={{ "marginTop": "16px" }} onClick={() => hideSignInButton()}>Hide Signin Button</IonButton>

        <IonButton style={{ "marginTop": "16px" }} onClick={() => openLoginPage()}>Show Login Page</IonButton>

        <IonButton style={{ "marginTop": "16px" }} onClick={() => checkWhatsappApp()}>Check Whatsapp</IonButton>

        <ExploreContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
