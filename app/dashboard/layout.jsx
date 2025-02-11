"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GlobalProviders from "@/components/dashboard-provider";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Send, MessageSquareText, Phone, LayoutGrid, Image as ImageIcon, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, Battery, Bluetooth, Volume2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import NotificationPanel from "@/components/notification-panel";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useWebRTC } from '@/components/webrtc-helper';
// import { useEffect, useState } from "react";

export default function DashboardLayout({ children }) {
  const router = useRouter();


    // const [messages, setMessages] = useState([]);

    // const { receivedMessages } = useWebRTC();


    // useEffect(() => {
    //     const newMessages = receivedMessages
    //         .map((msg) => {
    //             if (typeof msg === 'string') {
    //                 try {
    //                     return JSON.parse(msg);
    //                 } catch (e) {
    //                     console.error('Error parsing message:', e);
    //                     return null;
    //                 }
    //             }
    //             return msg;
    //         })
    //         .filter(
    //             (msg) =>
    //                 msg &&
    //                 msg.type == 'notification'
    //         );

    //     if (newMessages.length > 0) {
    //         setMessages((prevMessages) => [...prevMessages, ...newMessages]);
    //     }

    //     console.log("Notifications", receivedMessages);
    // }
    // , [receivedMessages]);
    
  return (
    <GlobalProviders>
        <div>
                <div className="flex h-screen">
                    {/* Left Sidebar */}
                    <div className="w-65 border-r bg-gray-50">
                        {/* Phone Details Section */}
                        <Card className="rounded-none border-none shadow-none">
                            <CardHeader className="pb-2">
                                <div className="flex items-center space-x-2">
                                    {/* <Phone className="h-6 w-6" /> */}
                                    <Image src="/image.png" alt="Pixel 6" width={37} height={37} />
                                    <CardTitle className="text-lg">Pixel 6</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                                    <Wifi className="h-4 w-4" />
                                    <Battery className="h-4 w-4" />
                                    <span>47%</span>
                                </div>
                                <Badge variant="success" className="mb-4">Connected</Badge>
                                <div className="flex space-x-2">
                                    <Button size="sm" variant="outline" className="flex-1">
                                        <Bluetooth className="h-4 w-4 mr-1" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1">
                                        <Volume2 className="h-4 w-4 mr-1" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1">
                                        <Music className="h-4 w-4 mr-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notifications Panel */}
                        <NotificationPanel />
                        
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow">
                        <Tabs defaultValue="chat" className="w-full">
                            <div className="flex justify-between items-center p-6 border-b">
                                <TabsList>
                                    <TabsTrigger value="chat" className="text-base" onClick={() => router.push("/dashboard/chat")}>
                                        <Send className="h-5 w-5 mr-2" />
                                        Chat
                                        <Badge variant="secondary" className="ml-2">1</Badge>
                                    </TabsTrigger>

                                    <TabsTrigger value="messages" className="text-base" onClick={() => router.push("/dashboard/message")}>
                                        <MessageSquareText className="h-5 w-5 mr-2" />
                                        Messages
                                        <Badge variant="secondary" className="ml-2">1</Badge>
                                    </TabsTrigger>
                                    
                                    <TabsTrigger value="photos" className="text-base">
                                        <ImageIcon className="h-5 w-5 mr-2" />
                                        Photos
                                    </TabsTrigger>
                                    
                                    <TabsTrigger value="calls" className="text-base">
                                        <Phone className="h-5 w-5 mr-2" />
                                        Calls
                                    </TabsTrigger>
                                    
                                    {/* <TabsTrigger value="apps" className="text-base">
                                        <LayoutGrid className="h-5 w-5 mr-2" />
                                        Apps
                                    </TabsTrigger> */}
                                </TabsList>

                                {/* <ThemeToggle /> */}
                                <Button variant="ghost" size="icon">
                                    <Settings className="h-5 w-5" />
                                </Button>
                            </div>
                            
                            <div className="p-6">
                            
                              {children}
                            
                              </div>

                           
                        </Tabs>
                    </div>
                </div>
        </div>
        </GlobalProviders>
    );
}
