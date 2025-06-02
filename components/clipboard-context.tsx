import React, { useEffect, useRef, useState } from "react";
import { readText } from "@tauri-apps/plugin-clipboard-manager";
import { useWebRTC } from "@/components/webrtc-helper";

interface Props {
  children: React.ReactNode;
}

const ClipboardMonitorContext = React.createContext(null);

export const ClipboardMonitorProvider: React.FC<Props> = ({ children }) => {
  const { peerConnectionRef, sendMessage } = useWebRTC();

  const lastContentRef = useRef<string>("");

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const current = await readText();

        if (current && current !== lastContentRef.current) {
          lastContentRef.current = current;

          console.log("Clipboard changed:", current);

          // send to android
          if (peerConnectionRef.current) {
            sendMessage(
              JSON.stringify({
                type: "Clipboard",
                content: current, // NOT `JSON.stringify({ current })`
              })
            );
          }
        }
      } catch (err) {
        console.error("Clipboard read failed:", err);
      }
    }, 1000); // every second

    return () => clearInterval(interval);
  }, []);

  return (
    <ClipboardMonitorContext.Provider value={null}>
      {children}
    </ClipboardMonitorContext.Provider>
  );
};
