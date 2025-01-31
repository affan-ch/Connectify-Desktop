"use client";

import { AuthProvider } from "@/components/auth-context";
import { DeviceProvider } from "@/components/device-context";
import { WebRTCProvider } from "@/components/webrtc-helper";
import { useEffect, useState } from "react";

export default function GlobalProviders({ children }) {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    // Retrieve 'devices' from localStorage when the component mounts
    const storedDevices = localStorage.getItem("devices");
    if (storedDevices) {
      setDevices(JSON.parse(storedDevices));
    }
  }, []); // Runs only once on mount

  return (
    <AuthProvider>
      <DeviceProvider>
        <WebRTCProvider devices={devices}>
        {children}
        </WebRTCProvider>
      </DeviceProvider>
    </AuthProvider>
  );
}
