"use client"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard-sidebar"
import GlobalProviders from "@/components/dashboard-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, MessageSquareText, Phone, LayoutGrid, Image as ImageIcon, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function DashboardLayout({ children }) {
  const router = useRouter();

  return (
    <GlobalProviders>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main className="flex-grow flex flex-col">
            <Tabs defaultValue="chat" className="w-full">
              <div className="flex justify-between items-center p-4">
                <TabsList className="bg-white">
                  <TabsTrigger value="chat" className="text-base" onClick={() => router.push("/dashboard")}>
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

                  <TabsTrigger value="apps" className="text-base">
                    <LayoutGrid className="h-5 w-5 mr-2" />
                    Apps
                  </TabsTrigger>
                </TabsList>

                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>

              <div className="bg-white rounded-tl-xl shadow-md w-full border-t-2 border-l-2 border-[#2563EB]">
                {children}
              </div>
            </Tabs>
          </main>
        </div>
      </SidebarProvider>
    </GlobalProviders>
  );
}
