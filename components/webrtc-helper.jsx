import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const WebRTCContext = createContext();

export const WebRTCProvider = ({ children }) => {
  const [offerSdp, setOfferSdp] = useState('');
  const [answerSdp, setAnswerSdp] = useState('');
  const [message, setMessage] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [iceCandidates, setIceCandidates] = useState([]);
  const [socket, setSocket] = useState(null);
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);

  // Establish a connection and create WebRTC offer
  const initializeConnection = async (loginToken, deviceToken) => {
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
    dataChannelRef.current.onclose = () => console.log('Data channel is closed');

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    const offerSdpString = JSON.stringify(peerConnectionRef.current.localDescription);
    setOfferSdp(offerSdpString);

    // Establish socket connection
    const socketInstance = io('http://localhost:8006');
    setSocket(socketInstance);

    // Register user
    socketInstance.emit('register', { loginToken, deviceToken });

    // Send offer SDP via socket
    socketInstance.emit('webrtc_offer', { loginToken, deviceToken, offer: offerSdpString, targetDeviceId: '2bdb5875-cf7b-496b-995c-8146ee2d3b70' });

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
