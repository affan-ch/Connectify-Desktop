"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import React, { useState, useEffect, useRef } from 'react';
import { useWebRTC } from '@/components/webrtc-helper';

// function formatTimestamp(timestamp) {
//     const date = new Date(Number(timestamp));
//     return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
// }

function formatTimestamp(timestamp) {
    const date = new Date(Number(timestamp));
    let hours = date.getHours() % 12 || 12; // Convert 0 -> 12 for 12-hour format
    let minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two-digit minutes
    return `${hours}:${minutes}`;
}

export default function NotificationPanel() {

    const { initializeConnection, peerConnectionRef, receivedMessages } = useWebRTC();
    const [notifications, setNotifications] = useState([]);


    useEffect(() => {
        const loginToken = localStorage.getItem('token');
        const deviceToken = localStorage.getItem('deviceToken');

        if (peerConnectionRef.current == null) {
            initializeConnection(loginToken, deviceToken);
        }
    }, [peerConnectionRef]);

    useEffect(() => {
        const allNotifications = receivedMessages
            .map((msg) => {
                if (typeof msg === 'string') {
                    try {
                        return JSON.parse(msg);
                    } catch (e) {
                        console.error('Error parsing message:', e);
                        return null;
                    }
                }
                // Ensure the message is valid and of type 'notification'
                if (msg && msg.type === 'notification' && typeof msg.content === 'string') {
                    try {
                        msg.content = JSON.parse(msg.content);
                    } catch (e) {
                        console.error('Error parsing content:', e);
                        return null;
                    }
                }

                return msg;
            })
            .filter(
                (msg) =>
                    msg &&
                    msg.type === 'notification'
            );

        console.log("AllNotifications", allNotifications);
        if (allNotifications.length > 0) {
            // setNotifications((prevNotifications) => [...prevNotifications, ...allNotifications]);
            setNotifications(allNotifications);
        }
    }, [receivedMessages]);

    return (
        <>
            {/* Notifications Panel */}
            <Card className="rounded-none border-none shadow-none">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                        Notifications

                        <Button size="sm" variant="ghost" className="text-muted-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[calc(100vh-250px)]">
                        {notifications.map((notification, index) => (
                            <div key={index} className="mb-4 last:mb-0 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-md">{notification.content.appName}</span>
                                    <span className="text-xs text-muted-foreground">{formatTimestamp(notification.content.postTime)}</span>
                                </div>
                                <p className="text-md text-muted-foreground ml-5">{notification.content.title}</p>
                                <p className="text-sm text-muted-foreground ml-5">{notification.content.content}</p>
                                {notification.action && (
                                    <div className="mt-2">
                                        <Button variant="link" className="p-0 h-auto text-sm text-blue-500">
                                            {notification.action}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </ScrollArea>
                </CardContent>
            </Card>
        </>
    );
}