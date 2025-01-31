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

  useEffect(() => {
    if (offerSdp) {
      if (devices) {
        for (let device of devices) {
          if (device.deviceType == "mobile") {
            console.log('Sending offer to device:', device.id);
            socket.emit('webrtc_offer', { loginToken, deviceToken, offer: offerSdp, targetDeviceId: device.id });
          }
        }
      }
    }
  }, [offerSdp, devices]);


  // Establish a connection and create WebRTC offer
  const initializeConnection = async (loginToken, deviceToken) => {
    setLoginToken(loginToken);
    setDeviceToken(deviceToken);

    const config = {
      iceServers: [
        {
          urls: 'turn:68.183.132.84:3478?transport=udp',
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
    dataChannelRef.current.onmessage = (event) => {
      let message = JSON.parse(event.data);
      console.log('Received message:', message);
      setReceivedMessages((prev) => [...prev, message]);

    }
    dataChannelRef.current.onclose = () => {
      console.log('Data channel is closed');
      peerConnectionRef.current.close();
      setAnswerSdp('');
      dataChannelRef.current = null;
      peerConnectionRef.current = null;
      setOfferSdp('');
      setIceCandidates([]);
    }

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    const offerSdpString = JSON.stringify(peerConnectionRef.current.localDescription);
    setOfferSdp(offerSdpString);

    // Establish socket connection
    const socketInstance = io('http://localhost:8006');
    setSocket(socketInstance);

    // Register user
    socketInstance.emit('register', { loginToken, deviceToken });

    socketInstance.on('mobile_connected', async (data) => {
      console.log('Mobile is online and waiting for offer');
      const { deviceId } = data;

      // Send offer SDP via socket
      socketInstance.emit('webrtc_offer', { loginToken, deviceToken, offer: offerSdpString, targetDeviceId: deviceId });
    });

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
      // setReceivedMessages((prev) => [...prev, JSON.parse(text)]);
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
