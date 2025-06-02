"use client";
import { getAppIcons } from "@/db/appIcon";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Smartphone } from "lucide-react";
import Image from "next/image";
import { AppIcon } from "@/models/AppIcon";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Page() {
  const [appIcons, setAppIcons] = useState<AppIcon[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchAppIcons = async () => {
      const appIconsList = await getAppIcons();
      setAppIcons(appIconsList);
    };

    fetchAppIcons();
  }, []);

//   const favorites = appIcons.slice(0, 5);
  const allApps = appIcons;

  const handleRefresh = async () => {
    try {
      // const freshIcons = await getAppIcons()
      // setAppIcons(freshIcons)
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to refresh app icons:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Apps</h1>
            <p className="text-sm text-muted-foreground">
              Last updated on {lastUpdated.toLocaleDateString()} at{" "}
              {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* {favorites.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Favorites</h2>
            <div className="grid grid-cols-5 gap-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5">
              {favorites.map((app) => (
                <AppIconCard key={app.packageName} app={app} />
              ))}
            </div>
          </div>
        )} */}

        <div>
          <h2 className="text-xl font-bold mb-4">All apps</h2>
          <ScrollArea className="h-[570px] w-[100%]">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {allApps.map((app) => {
              if (app.packageName === app.appName || 
                app.packageName.startsWith("com.android") || 
                app.packageName.startsWith("com.google") || 
                app.packageName.startsWith("com.verizon") ||
                app.packageName.startsWith("com.samsung") || 
                app.packageName.startsWith("com.shannon") ||
                app.packageName.startsWith("android.autoinstalls") ||
                app.packageName.startsWith("com.vzw")) return null; // Skip apps where packageName equals appName
              return <AppIconCard key={app.packageName} app={app} />;
            })}
          </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

function AppIconCard({ app }: { app: AppIcon }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-14 w-14 mb-2 overflow-hidden rounded-2xl">
        {app.appIconBase64 ? (
          <Image
            src={`data:image/png;base64,${app.appIconBase64}`}
            alt={app.appName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center rounded-2xl">
            <Smartphone className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <span className="text-sm text-center">{app.appName}</span>
    </div>
  );
}
