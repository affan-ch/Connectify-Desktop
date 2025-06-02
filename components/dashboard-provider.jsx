"use client";

import { AuthProvider } from "@/components/auth-context";
import { DeviceProvider } from "@/components/device-context";
import { WebRTCProvider } from "@/components/webrtc-helper";
import { useEffect, useState } from "react";
import Loader from "./loader";
import { ClipboardMonitorProvider } from "@/components/clipboard-context";

export default function GlobalProviders({ children }) {
  const [devices, setDevices] = useState(null); // null means "not loaded yet"

  useEffect(() => {
    const interval = setInterval(() => {
      const storedDevices = localStorage.getItem("devices");
      if (storedDevices) {
        setDevices(JSON.parse(storedDevices));
        clearInterval(interval);
      }
    }, 200); // check every 200ms

    // optional timeout fail-safe
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!devices) setDevices([]); // fallback to empty
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  if (devices === null) {
    // Still loading devices
    return <Loader />;
  }

  return (
    <AuthProvider>
      <DeviceProvider>
        <WebRTCProvider devices={devices}>
          <ClipboardMonitorProvider>
          {children}
          </ClipboardMonitorProvider>
        </WebRTCProvider>
      </DeviceProvider>
    </AuthProvider>
  );
}
