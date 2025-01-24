"use client";

import { AuthProvider } from "@/components/auth-context";
import { DeviceProvider } from "@/components/device-context";
import { WebRTCProvider } from "@/components/webrtc-helper";

export default function GlobalProviders({ children }) {
  return (
    <AuthProvider>
      <DeviceProvider>
        <WebRTCProvider>
        {children}
        </WebRTCProvider>
      </DeviceProvider>
    </AuthProvider>
  );
}
