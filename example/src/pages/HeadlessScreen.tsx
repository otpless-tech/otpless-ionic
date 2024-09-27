import { IonButton, IonContent, IonPage, IonTextarea, IonTitle, IonItem, IonInput, IonHeader, IonToolbar, IonToast } from '@ionic/react';
import {OtplessManager} from 'otpless-ionic';
import { useEffect, useState } from 'react';
import { APPID } from './Home';

const StartHeadless: React.FC = () => {
    let manager = new OtplessManager();

    useEffect(() => {
        manager.initHeadless(APPID);
        manager.setHeadlessCallback(onHeadlessResult);

        manager.setWebViewInspectable(true);
        return () => {
            manager.clearListener();
        }
    }, []);

    const [otplessResponse, setOtplessResponse] = useState('');
    const [countryCode, setCountryCode] = useState('91');
    const [phone, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [channelType, setChannelType] = useState('');

    const startWithPhoneAndEmail = async () => {
        let headlessRequest = {};

        if (phone.length > 0) {
            headlessRequest = {
                countryCode,
                phone,
            };
            if (otp.length > 0) {
                headlessRequest = {
                    countryCode,
                    phone,
                    otp,
                };
            }
        } else if (email.length > 0) {
            headlessRequest = {
                email,
            };
            if (otp.length > 0) {
                headlessRequest = {
                    email,
                    otp,
                };
            }
        }
        await manager.startHeadless(headlessRequest);
    };

    const onHeadlessResult = (data: any) => {
        let message: string = JSON.stringify(data);
        console.log("============= Headless Response ==================");
        console.log(message);
        setOtplessResponse(message);
    };

    const startWithChannel = async () => {
        let headlessRequest = { channelType: channelType.toUpperCase() };
        await manager.startHeadless(headlessRequest);
    };

    const copyResponse = () => {
        navigator.clipboard.writeText(otplessResponse);
    };

    const showPhoneHintLib = async () => {
        try {
            let response = await manager.showPhoneHintLib(true);
            if (response.phoneNumber) {
                setPhoneNumber(response.phoneNumber)
            } else if (response.error) {
                setOtplessResponse(response.error)
            }
        } catch (error) {
            console.error("Failed to get phone hint:", error);
            setOtplessResponse("An unexpected error occurred.")

        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Start Headless</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonItem style={{ marginTop: "16px", marginLeft: "16px", marginRight: "16px" }}>
                    <IonInput inputmode="numeric" value={phone} onIonInput={(e) => setPhoneNumber(e.detail.value!)} placeholder="Enter Phone Number" />
                </IonItem>
                <IonItem style={{ margin: "16px" }}>
                    <IonInput inputmode="numeric" value={countryCode} onIonInput={(e) => setCountryCode(e.detail.value!)} placeholder="Enter Country Code" />
                </IonItem>
                <IonItem style={{ margin: "16px" }}>
                    <IonInput inputmode="email" value={email} onIonInput={(e) => setEmail(e.detail.value!)} placeholder="Enter Email" />
                </IonItem>
                <IonItem style={{ margin: "16px" }}>
                    <IonInput value={otp} onIonInput={(e) => setOtp(e.detail.value!)} placeholder="Enter OTP" />
                </IonItem>
                <IonItem style={{ margin: "16px" }}>
                    <IonInput value={channelType} onIonInput={(e) => setChannelType(e.detail.value!.toUpperCase())} placeholder="Enter Channel Type" />
                </IonItem>

                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <IonButton expand="block" onClick={startWithPhoneAndEmail}>Start with Phone/Email</IonButton>
                    <IonButton expand="block" onClick={startWithChannel}>Start with Channel</IonButton>
                    <IonButton expand="block" onClick={showPhoneHintLib}>Show phone hint lib</IonButton>

                    <IonButton expand="block" onClick={copyResponse}>Copy Response</IonButton>
                </div>

                <IonTextarea autoGrow style={{ margin: "16px" }} value={otplessResponse} readonly></IonTextarea>

            </IonContent>
        </IonPage>
    );
};

export default StartHeadless;
