"use client"
import { invoke } from '@tauri-apps/api/core';

export default async function getDeviceInfo() {
  try {
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      console.log('Development environment detected, skipping device info fetch');

      const dummyData = {
        device_type: 'desktop',
        device_name: "Affan's MacBook Pro",
        model: 'MacBookPro15,1',
        os_name: 'macOS',
        os_version: '15.1.1',
        uuid: '50D7374B-BA01-5FBD-B765-6DA584E4DF20',
        serial_number: 'C02YV05LLVCG',
        board_id: 'Mac-937A206F2EE63C01',
        timezone: 'PKT',
        manufacturer: 'Apple Inc.',
      };

      console.log(dummyData);
      
      return dummyData; // Return dummy data
    }
    const deviceInfo = await invoke('get_device_info'); // Call the Rust command
    console.log(deviceInfo);
    return deviceInfo; // Return the device info
  } catch (error) {
    console.error('Error fetching device info:', error);
    return null; // Handle error by returning null or an appropriate error message
  }
};
