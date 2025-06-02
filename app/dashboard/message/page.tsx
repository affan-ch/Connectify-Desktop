"use client"
import React, { useEffect, useState } from "react";
import { Message } from "@/models/Message";
import { getMessages } from "@/db/message";

export default function MessagesContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        setLoading(true);
        const msgs = await getMessages();
        setMessages(msgs);
      } catch (err) {
        setError("Failed to load messages.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading messages...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return <MessagesUI messages={messages} />;
}

function MessagesUI({ messages }: { messages: Message[] }) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Group messages by threadId (contact conversation)
  const groupedMessages = messages.reduce<Record<string, Message[]>>(
    (acc, msg) => {
      if (!acc[msg.threadId]) acc[msg.threadId] = [];
      acc[msg.threadId].push(msg);
      return acc;
    },
    {}
  );

  // Create an array of thread summaries with latest message and contact info
  const threads = Object.entries(groupedMessages).map(([threadId, msgs]) => {
    msgs.sort((a, b) => b.timestamp! - a.timestamp!); // newest first
    const latestMessage = msgs[0];
    return {
      threadId,
      contactName: latestMessage.contactName || latestMessage.phoneNumber,
      contactNumber: latestMessage.phoneNumber,
      latestMessage,
    };
  });

  // Get messages for selected thread and sort oldest first for conversation view
  const currentThreadMessages = selectedThreadId
    ? (groupedMessages[selectedThreadId] || []).sort(
        (a, b) => a.timestamp! - b.timestamp!
      )
    : [];

  return (
    <div className="flex h-screen">
      {/* Left column - Messages List */}
      <div className="w-[450px] border-r bg-white rounded-xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Messages</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
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
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          Recent
        </div>

        {/* Messages list */}
        <div className="overflow-y-auto flex-1">
          {threads.map(({ threadId, contactName, latestMessage }) => (
            <div
              key={threadId}
              onClick={() => setSelectedThreadId(threadId)}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                selectedThreadId === threadId ? "bg-gray-50" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white">
                  {contactName.charAt(0)}
                </div>

                {/* Message preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span className="font-semibold">{contactName}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(
                        latestMessage.timestamp! * 1000
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {latestMessage.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right column - Conversation Window */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedThreadId ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white">
                  {threads
                    .find((t) => t.threadId === selectedThreadId)
                    ?.contactName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {
                      threads.find((t) => t.threadId === selectedThreadId)
                        ?.contactName
                    }
                  </span>
                  <span className="font-normal text-gray-500 text-sm">
                    {
                      threads.find((t) => t.threadId === selectedThreadId)
                        ?.contactNumber
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Chat messages (scrollable only) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {currentThreadMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                    message.sender === 1 ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl break-words ${
                      message.sender === 1
                        ? "bg-blue-500 text-white rounded-tr-none"
                        : "bg-gray-200 text-gray-900 rounded-tl-none"
                    }`}
                  >
                    {message.content}
                  </div>

                  <span
                    className={`text-xs text-gray-500 mt-1 px-2 ${
                      message.sender === 1 ? "text-right" : "text-left"
                    }`}
                  >
                    {new Date(message.timestamp! * 1000).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}{" "}
                    • SIM {message.simSlot}
                  </span>
                </div>
              ))}
            </div>

            {/* Message input */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  😊
                </button>
                <input
                  type="text"
                  placeholder="Send a message"
                  className="flex-1 p-2 rounded-lg bg-gray-100 focus:outline-none"
                />
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
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
  );
}
