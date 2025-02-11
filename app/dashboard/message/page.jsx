// app/messages/page.jsx
'use client'

import { useState } from 'react'

export default function MessagesPage() {
  // Selected conversation state
  const [selectedContact, setSelectedContact] = useState(null)

  const messages = [
    {
      id: '1',
      contactName: "Nawaz Shareef",
      contactNumber: "03001234567",
      messages: [
        {
          timestamp: "5 min ago",
          messageContent: "Hello, Imran Bhai",
          messageType: "sent",
          simUsed: "SIM 1",
        },
        {
          timestamp: "Yesterday",
          messageContent: "Kha ho yrrr",
          messageType: "sent",
          simUsed: "SIM 1",
        },
        {
          timestamp: "Yesterday",
          messageContent: "I'm good, how are you?",
          messageType: "received",
          simUsed: "SIM 1",
        }
      ],
    },
    {
      id: '2',
      contactName: "Ali Jan",
      contactNumber: "03001234568",
      messages: [
        {
          timestamp: "10 min ago",
          messageContent: "Hi",
          messageType: "received",
          simUsed: "SIM 2",
        },
      ],
    },
  ];

  return (
    // Main container with two columns
    <div className="flex h-screen bg-gray-100">
      {/* Left column - Messages List */}
      <div className="w-1/3 border-r bg-white">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Messages</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search messages"
            className="w-full p-2 rounded-lg bg-gray-100 text-sm focus:outline-none"
          />
        </div>

        {/* Recent section */}
        <div className="px-4 py-2 flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Recent
        </div>

        {/* Messages list */}
        <div className="overflow-y-auto">
          {messages.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact.id)}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedContact === contact.id ? 'bg-gray-50' : ''}`}
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white">
                  {contact.contactName.charAt(0)}
                </div>

                {/* Message preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span className="font-semibold">{contact.contactName}</span>
                    <span className="text-xs text-gray-500">{contact.messages[0].timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {contact.messages[0].messageContent}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right column - Conversation Window */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedContact ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white">
                  {messages.find(m => m.id === selectedContact)?.contactName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {messages.find(m => m.id === selectedContact)?.contactName}
                  </span>
                  <span className='font-normal text-gray-500 text-sm'>
                    {messages.find(m => m.id === selectedContact)?.contactNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Chat messages (scrollable only) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages
                .find(m => m.id === selectedContact)
                ?.messages
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).reverse() // Ensure proper sorting
                .map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${message.messageType === 'sent' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[75%] p-3 rounded-2xl break-words ${message.messageType === 'sent'
                      ? 'bg-blue-500 text-white rounded-tr-none'
                      : 'bg-gray-200 text-gray-900 rounded-tl-none'
                      }`}>
                      {message.messageContent}
                    </div>

                    <span className={`text-xs text-gray-500 mt-1 px-2 ${message.messageType === 'sent' ? 'text-right' : 'text-left'}`}>
                      {message.timestamp} • {message.simUsed}
                    </span>
                  </div>
                ))}
            </div>

            {/* Message input */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-full">😊</button>
                <input
                  type="text"
                  placeholder="Send a message"
                  className="flex-1 p-2 rounded-lg bg-gray-100 focus:outline-none"
                />
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          // Placeholder when no conversation is selected
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  )
}