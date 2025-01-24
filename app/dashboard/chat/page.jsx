"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useWebRTC } from '@/components/webrtc-helper';

const ChatPage = () => {
  const {
    initializeConnection,
    peerConnectionRef,
    sendMessage,
    receivedMessages,
    setMessage,
    message,
  } = useWebRTC();
  const receivedMessageTimestamps = useRef(new Set());

  // Get the login token and device token from the local storage
  useEffect(() => {
    const loginToken = localStorage.getItem('token');
    const deviceToken = localStorage.getItem('deviceToken');

    console.log("Reached in chat page");

    if (peerConnectionRef.current == null) {
      console.log("Peer connection is null");
      initializeConnection(loginToken, deviceToken);
    }
  }, [peerConnectionRef]);

  const [messages, setMessages] = useState([]);

  // Update messages from receivedMessages
  useEffect(() => {
    const newMessages = receivedMessages
      .map((msg) => {
        if (typeof msg === 'string') {
          try {
            return JSON.parse(msg);
          } catch (e) {
            console.error('Error parsing message:', e);
            return null;
          }
        }
        return msg;
      })
      .filter(
        (msg) =>
          msg &&
          !receivedMessageTimestamps.current.has(msg.timestamp) // Filter out already displayed messages
          && msg.type === 'chat'
      );

    if (newMessages.length > 0) {
      newMessages.forEach((msg) => receivedMessageTimestamps.current.add(msg.timestamp));
      setMessages((prevMessages) => [...prevMessages, ...newMessages]);
    }

    console.log("Received messages", receivedMessages);
    console.log("Parsed messages", newMessages);
  }, [receivedMessages]);

  const handleSendMessage = (content) => {
    const newMessage = {
      type: 'chat',
      content,
      timestamp: new Date().toLocaleString('en-GB', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit'
      }),
      sender: 'desktop',
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Call sendMessage from useWebRTC
    console.log(newMessage);
    sendMessage(JSON.stringify(newMessage));
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col h-[700px] w-[500px] mx-auto border rounded-lg overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.timestamp} message={message} />
          ))}
          <div ref={useRef(null)} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (message.trim()) {
              handleSendMessage(message);
              setMessage('');
            }
          }}
          className="p-4 border-t"
        >
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MessageBubble = ({ message }) => {
  console.log("Message Bubble", message);
  const isUser = message?.sender === 'desktop';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
      >
        <p>{message.content}</p>
      </div>
    </div>
  );
};

export default ChatPage;
