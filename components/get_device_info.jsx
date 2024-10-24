import { invoke } from '@tauri-apps/api/core';

export default async function getDeviceInfo() {
  try {
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      console.log('Development environment detected, skipping device info fetch');

      const dummyData = {
        device_type: 'desktop',
        device_name: "Affan's MacBook",
        model: 'MacBook Pro (15-inch, 2019)',
        os_name: 'macOS',
        os_version: '11.2.3',
        uuid: '1234567890',
        serial_number: 'C02Z12345678',
        board_id: 'Mac-1234567890abcdef',
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
