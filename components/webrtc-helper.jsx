import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

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

  const setupWebRTC = async () => {

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
    dataChannelRef.current.onopen = () => console.log('Data channel is open');
    dataChannelRef.current.onclose = () => {
      console.log('Data channel is closed');
      clearWebRTC();
    }
    dataChannelRef.current.onmessage = (event) => {
      let message = JSON.parse(event.data);
      console.log('Received message:', message);

      if (message.type === 'Notification:Posted') {
        setPostedNotifications((prev) => [...prev, message]);
      } else if (message.type === 'Notification:Removed') {
        setRemovedNotifications((prev) => [...prev, message]);
      } else if (message.type === 'Notification:AllActive') {
        console.log("All Active Notifications:", message);
        setAllActiveNotifications([message]);
      } else if (message.type === 'DeviceStateInfo') {
        console.log("Device State Info:", message);
        setDeviceInfo(message);
      } else {
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
