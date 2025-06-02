import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { storeDeviceStateFields } from './dataStore';
import { getAppIconsList, storeAppIcon, getAppIconById, getAppIconByPackageName } from '@/db/appIcon';
import { clearContacts, createContact } from '@/db/contact';
import { clearCallLogs, createCallLog, insertCallLogsBatch } from '@/db/callLog';
import { createNotification, clearNotifications } from '@/db/notification';
import { clearMessages, createMessage } from '@/db/message';

const WebRTCContext = createContext();

export const WebRTCProvider = ({ children, devices }) => {
  const [offerSdp, setOfferSdp] = useState('');
  const [answerSdp, setAnswerSdp] = useState('');
  const [message, setMessage] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [iceCandidates, setIceCandidates] = useState([]);
  const [socket, setSocket] = useState(null);
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const [loginToken, setLoginToken] = useState('');
  const [deviceToken, setDeviceToken] = useState('');

  const [postedNotifications, setPostedNotifications] = useState([]);
  const [allActiveNotifications, setAllActiveNotifications] = useState([]);
  const [removedNotifications, setRemovedNotifications] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState('');

  useEffect(() => {
    if (offerSdp) {
      if (devices) {
        for (let device of devices) {
          if (device.deviceType == "mobile") {
            console.log('Sending offer to device from useEffect:', device.id);

            socket.emit('webrtc_offer', { loginToken, deviceToken, offer: offerSdp, targetDeviceId: device.id });
          }
        }
      }
    }
  }, [offerSdp, devices]);

  const clearWebRTC = () => {
    console.log('Clearing WebRTC state');
    peerConnectionRef.current = null;
    dataChannelRef.current = null;
    setOfferSdp('');
    setAnswerSdp('');
    setIceCandidates([]);
    setReceivedMessages([]);
    setMessage([]);
    setPostedNotifications([]);
    setAllActiveNotifications([]);
    setRemovedNotifications([]);
    setDeviceInfo('');
  };

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const setupWebRTC = async () => {
    console.log('Setting up WebRTC connection');

    const config = {
      iceServers: [
        {
          urls: 'turn:68.183.132.84:3478',
          username: 'myturnserveruser',
          credential: 'PaswordOfSomethingScary69',
        },
      ],
    };

    peerConnectionRef.current = new RTCPeerConnection(config);

    // Handle ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        setIceCandidates((prev) => [...prev, event.candidate]);
      }
    };

    // Create data channel and handle its state
    dataChannelRef.current = peerConnectionRef.current.createDataChannel('sendChannel');
    dataChannelRef.current.onopen = async () => {
      console.log('Data channel is open');
      // get app icons and send them over the data channel
      const appIcons = await getAppIconsList();

      dataChannelRef.current.send(JSON.stringify({ type: 'AppIcon:Request', content: appIcons }));

    };
    dataChannelRef.current.onclose = () => {
      console.log('Data channel is closed');
      clearWebRTC();
    }
    dataChannelRef.current.onmessage = async (event) => {
      let message = JSON.parse(event.data);
      console.log('Received message:', message);

      if (message.type === 'Notification:Posted') {
        setPostedNotifications((prev) => [...prev, message]);
      } else if (message.type === 'Notification:Removed') {
        setRemovedNotifications((prev) => [...prev, message]);
      } else if (message.type === 'Notification:AllActive') {
        console.log("All Active Notifications:", message);
        setAllActiveNotifications([message]);

        await clearNotifications();
        console.log("Cleared all notifications from database");
        let notifications = JSON.parse(message.content);
        for (let notification of notifications) {
          console.log("Processing notification:", notification);
          if (!notification.packageName || !notification.appName) {
            continue;
          }
          if (notification.title == null){
            continue;
          }
          if(notification.packageName == notification.appName){
            continue;
          }
          const iconId = await getAppIconByPackageName(notification.packageName);
          if (!iconId) {
            continue;
          }
          notification.iconId = iconId.id;
          await createNotification(notification);
        }
      } else if (message.type === 'DeviceStateInfo') {
        console.log("Device State Info:", message);
        let content = JSON.parse(message.content);
        await storeDeviceStateFields(content);
        setDeviceInfo(message);
      }
      else if (message.type === 'AppIcon:SinglePackage') {
        console.log("Received single app icon package:", message);

        let { appName, packageName, packageVersion, appIconBase64 } = JSON.parse(message.content);

        await storeAppIcon({ appName, packageName, packageVersion, appIconBase64 });
        console.log(`App icon for ${appName} stored successfully.`);
      }
      else if (message.type === 'Contacts') {
        const contacts = JSON.parse(message.content);
        await clearContacts();
        contacts.forEach(async (contact) => {
          await createContact(contact);
          await delay(10); // Small delay to avoid overwhelming the database
        });
      }
      else if (message.type === 'CallLogs') {
        const callLogs = JSON.parse(message.content);
        console.log("Received call logs:", callLogs);
        await clearCallLogs();
        callLogs.forEach(async (log) => {
          await createCallLog(log);
          await delay(10); // Small delay to avoid overwhelming the database
        });
      }
      else if(message.type == 'Gallery:Folders'){
        const galleryData = JSON.parse(message.content);
        console.log("Received gallery data:", galleryData);
      }
      else if(message.type == 'Messages'){
        const messages = JSON.parse(message.content);
        console.log("Received messages:", messages);
        await clearMessages();

        for (const message of messages) {
          await createMessage(message);
          await delay(10); // Small delay to avoid overwhelming the database
        }
      }
      else {
        setReceivedMessages((prev) => [...prev, message]);
      }
    }


    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    const offerSdpString = JSON.stringify(peerConnectionRef.current.localDescription);
    setOfferSdp(offerSdpString);

    return offerSdpString;
  };


  // Establish a connection and create WebRTC offer
  const initializeConnection = async (loginToken, deviceToken) => {
    console.log('Initializing WebRTC connection');

    setLoginToken(loginToken);
    setDeviceToken(deviceToken);

    // Establish socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SERVER_URL);
    setSocket(socketInstance);

    // Setup WebRTC
    clearWebRTC();
    await setupWebRTC();

    // Register user
    socketInstance.emit('register', { loginToken, deviceToken });

    // Mobile connected event
    socketInstance.on('mobile_connected', async (data) => {
      console.log('Mobile is online and waiting for offer');
      const { deviceId } = data;

      clearWebRTC();
      const offerSdpString = await setupWebRTC();
      console.log('Offer SDP:', offerSdpString);

      // Send offer SDP via socket
      socketInstance.emit('webrtc_offer', { loginToken, deviceToken, offer: offerSdpString, targetDeviceId: deviceId });

    });

    socketInstance.on('mobile_disconnected', (data) => {
      const { deviceId } = data;
      console.log('Mobile disconnected with ID:', deviceId);
      clearWebRTC();
    });


    // Handle WebRTC answer
    socketInstance.on('webrtc_answer', async (data) => {
      const { answer } = data;
      console.log('Received WebRTC answer:', JSON.parse(answer));
      setAnswerSdp(answer);
      let { sdp } = JSON.parse(answer);

      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }));

      iceCandidates.forEach((candidate) => {
        peerConnectionRef.current.addIceCandidate(candidate);
      });
    });

    socketInstance.on('registration_ack', () => {
      console.log(`Registration acknowledged`);
    });

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
      peerConnectionRef.current.close();
    };
  };

  // Function to send a message via the data channel
  const sendMessage = (text) => {
    if (dataChannelRef.current?.readyState === 'open') {
      dataChannelRef.current.send(text);
    } else {
      console.error('Data channel is not open');
    }
  };

  return (
    <WebRTCContext.Provider
      value={{
        initializeConnection,
        peerConnectionRef,
        sendMessage,
        receivedMessages,
        offerSdp,
        answerSdp,
        message,
        setMessage,
        postedNotifications,
        allActiveNotifications,
        removedNotifications,
        deviceInfo,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error('useWebRTC must be used within a WebRTCProvider');
  }
  return context;
};
