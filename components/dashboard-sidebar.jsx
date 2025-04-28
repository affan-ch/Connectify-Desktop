import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader
} from "@/components/ui/sidebar";

import Image from "next/image";

import { Separator } from "@/components/ui/separator"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    PiCellSignalHighBold,
    PiCellSignalXBold,
    PiCellSignalFullBold,
    PiWifiHighBold,
    PiWifiXBold,
    PiWifiX,
    PiBatteryFullFill,
    PiBatteryHighFill,
    PiBatteryMediumFill,
    PiBatteryLowFill,
    PiBatteryEmptyFill,
    PiBluetoothBold,
    PiBluetoothXBold,
    PiCheckCircleBold
} from "react-icons/pi";

import { LuBellRing, LuMusic, LuCircleMinus, LuVolume2, LuRefreshCw } from "react-icons/lu";

import NotificationPanel from "@/components/notification-panel";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" className="border-none">
            <SidebarHeader>
                <div className="flex flex-col p-4 rounded-xl w-full">
                    {/* Main Container */}
                    <div className="flex flex-row gap-6">
                        {/* Left Side */}
                        <div className="flex flex-row gap-4">
                            {/* Phone Image Placeholder */}
                            <div className="w-12 h-21 rounded-md bg-gradient-to-b from-blue-300 to-blue-500 border-2 border-black" />

                            {/* Phone Info */}
                            <div className="flex flex-col gap-2">
                                {/* Device Name */}
                                <div className="text-base font-semibold">Pixel 6</div>

                                {/* Icons Row */}
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <PiBluetoothXBold size={16} />
                                    <PiWifiHighBold size={16} />
                                    <PiCellSignalFullBold size={16} />
                                    <div className="flex gap-1">
                                        <PiBatteryHighFill size={16} />
                                        <span className="text-xs">70%</span>
                                    </div>
                                </div>

                                {/* Connected Box */}
                                <div className="flex items-center border-2 rounded-md w-37">
                                    {/* Left: Connected */}
                                    <div className="flex items-center text-green-600 cursor-pointer">
                                        <Button variant="ghost" className="h-7 w-[110px] rounded-none rounded-tl-md rounded-bl-md">
                                            <PiCheckCircleBold size={16} />
                                            <span className="text-sm text-black">Connected</span>
                                        </Button>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-full border-l-2 border-gray" />

                                    {/* Right: Refresh */}
                                    <div className="flex items-center justify-center w-full">
                                        <Button variant="ghost" size="icon" className="h-7 w-9 rounded-none rounded-tr-md rounded-br-md">
                                            <LuRefreshCw size={16} className="cursor-pointer text-muted-foreground" />
                                        </Button>
                                    </div>
                                </div>

                            </div>
                        </div>


                    </div>

                    {/* Right Side - Action Buttons */}
                    <div className="flex justify-between mt-5 w-full">
                        {/* Do Not Disturb */}
                        <Button variant="outline" className="w-[70px] h-[35px] bg-white">
                            <LuCircleMinus size={18}/>
                        </Button>

                        {/* Vibrate/Volume */}
                        <Button className="w-[70px] h-[35px]">
                            <LuVolume2 size={18} />
                        </Button>

                        {/* Music Icon */}
                        <Button className="w-[70px] h-[35px]">
                            <LuMusic size={18} />
                        </Button>

                        {/* Play Sound on Phone */}
                        <Button variant="outline" className="w-[70px] h-[35px]">
                            <LuBellRing size={18} />
                        </Button>
                    </div>
                </div>
                <Separator />

            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                            <NotificationPanel />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
