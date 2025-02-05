"use client";

import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { TrayIcon } from "@tauri-apps/api/tray";
import { Menu, MenuItem } from "@tauri-apps/api/menu";
import { defaultWindowIcon } from "@tauri-apps/api/app";
import { invoke } from '@tauri-apps/api/core';

async function toggleTaskbarVisibility(hideIcon) {
  try {
    if (hideIcon) {
      await invoke("hide_taskbar_icon");
    }
    else {
      await invoke("show_taskbar_icon");
    }
    console.log(`Taskbar icon ${hideIcon ? "hidden" : "restored"}.`);
  } catch (error) {
    console.error("Failed to update activation policy:", error);
  }
}

export default function TrayManager() {
  let window = getCurrentWindow();
  let toggleItem;

  window.onCloseRequested(async (event) => {
    event.preventDefault();
    const isVisible = await window.isVisible();
    if (isVisible) {
      await window.hide();
      toggleTaskbarVisibility(true);
      await window.setSkipTaskbar(true);

      // Update menu item text when window is hidden
      if (toggleItem) {
        await toggleItem.setText("Show Window");
      }
    }
  });

  useEffect(() => {
    async function initTray() {
      try {
        const existingTray = await TrayIcon.getById("connectify").catch(() => null);
        if (existingTray) return;

        const appWindow = getCurrentWindow();

        // Create toggle visibility menu item
        toggleItem = await MenuItem.new({
          text: "Hide Window",
          action: async () => {
            const isVisible = await appWindow.isVisible();
            if (isVisible) {
              await appWindow.hide();
              toggleTaskbarVisibility(true);
              await appWindow.setSkipTaskbar(true);
              await toggleItem.setText("Show Window");
            } else {
              await appWindow.show();
              await appWindow.setFocus();
              await appWindow.setSkipTaskbar(false);
              toggleTaskbarVisibility(false);
              await toggleItem.setText("Hide Window");
            }
          },
        });

        const quitItem = await MenuItem.new({
          text: "Quit",
          action: async () => {
            await appWindow.destroy();
          },
        });

        const options = {
          id: "connectify",
          icon: await defaultWindowIcon(),
          tooltip: "Connectify",
          action: async (event) => {
            switch (event.type) {
              case 'Click':
                console.log(
                  `mouse ${event.button} button pressed, state: ${event.buttonState}`
                );

                if (event.button == "Left" && event.buttonState == "Up") {
                  const isVisible = await appWindow.isVisible();
                  if (!isVisible) {
                    appWindow.show();
                    appWindow.setFocus();
                    appWindow.setSkipTaskbar(false);
                    toggleTaskbarVisibility(false);
                    toggleItem.setText("Hide Window");
                  }
                }

                break;
            }
          },
        };

        // Create menu
        const trayMenu = await Menu.new({ items: [toggleItem, quitItem] });

        const newTray = await TrayIcon.new(options);

        await newTray.setMenu(trayMenu);
        await newTray.setMenuOnLeftClick(false);
      } catch (error) {
        console.error("Error While Initializing System Tray:", error);
      }
    }

    initTray();
  }, []);

  return null;
}
