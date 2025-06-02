"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Bluetooth,
  UserRound
} from "lucide-react";
import { useEffect, useState } from "react";
import { getCallLogs } from "@/db/callLog";
import { CallLog } from "@/models/CallLog";

function getCallTypeIcon(callType: string) {
  switch (callType) {
    case "INCOMING":
      return <PhoneIncoming className="h-4 w-4 text-green-600" />;
    case "OUTGOING":
      return <PhoneOutgoing className="h-4 w-4 text-blue-600" />;
    case "MISSED":
      return <PhoneMissed className="h-4 w-4 text-red-600" />;
    case "REJECTED":
      return <PhoneMissed className="h-4 w-4 text-yellow-600" />;
    case "VOICEMAIL":
      return <PhoneIncoming className="h-4 w-4 text-purple-600" />;
    case "BLOCKED":
      return <PhoneMissed className="h-4 w-4 text-gray-600" />;
    default:
      return <PhoneIncoming className="h-4 w-4 text-gray-600" />;
  }
}

function getCallTypeText(callType: string) {
  switch (callType) {
    case "INCOMING":
      return "Incoming";
    case "OUTGOING":
      return "Outgoing";
    case "MISSED":
      return "Missed";
    case "REJECTED":
      return "Rejected";
    case "VOICEMAIL":
      return "Voicemail";
    case "BLOCKED":
      return "Blocked";
    default:
      return "Unknown";
  }
}

function getCallTypeColor(callType: string) {
  switch (callType) {
    case "INCOMING":
      return "text-green-600";
    case "OUTGOING":
      return "text-blue-600";
    case "MISSED":
      return "text-red-600";
    case "REJECTED":
      return "text-yellow-600";
    case "VOICEMAIL":
      return "text-purple-600";
    case "BLOCKED":
      return "text-gray-600";
    default:
      return "text-gray-600";
  }
}

function getAvatarColor(name: string | null, phoneNumber: string) {
  const colors = [
    "bg-pink-500",
    "bg-purple-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];

  const text = name || phoneNumber;
  const hash = text.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string | null, phoneNumber: string) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return phoneNumber.slice(-2);
}

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } else if (diffInDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  } else {
    return (
      date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      ` at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`
    );
  }
}

export default function CallsPage() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const logs = await getCallLogs();
        setCallLogs(logs);
      } catch (error) {
        console.error("Failed to fetch call logs:", error);
      }
    };

    fetchCallLogs();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="flex h-screen">
        {/* Left Pane - Call Logs (3/4 width) */}
        <div className="w-3/4 p-6 overflow-y-auto border-r">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Calls</h1>

          <div className="space-y-1">
            {callLogs.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  {!call.contactName ? (
                   
                    <Avatar className="h-12 w-12">
                      <AvatarFallback
                        className={"bg-green-500 text-white font-medium"}
                      >
                         <UserRound className="h-6 w-6 text-white-500" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-12 w-12">
                      <AvatarFallback
                        className={`${getAvatarColor(
                          call.contactName ?? null,
                          call.phoneNumber ?? null
                        )} text-white font-medium`}
                      >
                        {getInitials(
                          call.contactName ?? null,
                          call.phoneNumber
                        )}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className="flex flex-col">
                    <div className="font-medium text-foreground">
                      {call.contactName || call.phoneNumber}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {getCallTypeIcon(call.callType)}
                      <span className={getCallTypeColor(call.callType)}>
                        {getCallTypeText(call.callType)}
                      </span>
                      {call.duration !== 0 && (
                        <>
                          <span>•</span>
                          <span>{call.duration} sec</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {formatTimestamp(call.timestamp)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    SIM {call.simSlot}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane - Bluetooth Content (1/4 width) */}
        <div className="w-1/4 p-6 bg-muted/20">
          <Card className="h-fit">
            <CardContent className="p-6 text-center">
              {/* Laptop with Bluetooth icon and notification badge */}
              <div className="relative mb-6 flex justify-center">
                <div className="relative">
                  {/* Laptop base */}
                  <div className="w-22 h-16 bg-gray-300 rounded-lg border-4 border-gray-400 flex items-center justify-center">
                    {/* Screen */}
                    <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Bluetooth className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  {/* Laptop stand */}
                  <div className="w-24 h-2 bg-gray-400 rounded-b-lg mx-auto"></div>

                  {/* Notification badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-4">
                {"Your PC's Bluetooth is turned off"}
              </h3>

              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                To be able to connect, please turn it back on using the button
                below.
              </p>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                Enable
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
