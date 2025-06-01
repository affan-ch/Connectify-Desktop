"use client";
import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import getDeviceInfo from '@/components/get_device_info';
import { AuthContext } from '@/components/auth-context';

export const DeviceContext = createContext();

export const DeviceProvider = ({ children }) => {
    const router = useRouter();
    const { userData, isOtpVerified, loading: authLoading } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyDeviceToken = async () => {
            // Ensure user is authenticated and OTP is verified before checking device
            if (!userData || !isOtpVerified) {
                setLoading(false);
                return;
            }

            const deviceToken = localStorage.getItem('deviceToken');
            const token = localStorage.getItem('token');

            // If no device token, register the device
            if (!deviceToken) {
                try {
                    const deviceInfo = await getDeviceInfo();
                    const deviceResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/device/add`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${token}`, // Login token is required for device registration
                        },
                        body: JSON.stringify(deviceInfo),
                    });

                    if (deviceResponse.status == 200) {
                        const deviceData = await deviceResponse.json();
                        localStorage.setItem('deviceToken', deviceData.deviceToken);
                        console.log('Device registered successfully');

                        const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/device/getAll`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `${token}`, // Login token is required for device verification
                                'Device-Authorization': `${deviceData.deviceToken}`, // Device token is required for device verification
                            },
                        });

                        if (verifyResponse.status === 200) {
                            const result = await verifyResponse.json();
                            if (result.success) {
                                console.log('Device verified successfully');
                                // Continue to dashboard or wherever user was heading
                                localStorage.setItem('devices', JSON.stringify(result.devices));
                            } else {
                                console.log('Device verification failed');
                                localStorage.removeItem('token');
                                localStorage.removeItem('deviceToken');
                                localStorage.removeItem('devices');
                                router.push('/'); // Redirect to login if verification fails
                            }
                        } else {
                            console.log('Error verifying device');
                            localStorage.removeItem('token');
                            localStorage.removeItem('deviceToken');
                            localStorage.removeItem('devices');
                            router.push('/'); // Redirect to login on failure
                        }

                    } else {
                        console.log('Error registering device');
                        localStorage.removeItem('token');
                        localStorage.removeItem('deviceToken'); // Ensure no faulty token is stored
                        router.push('/'); // Redirect to login if device registration fails
                    }
                } catch (error) {
                    console.error('Error registering device:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('deviceToken'); // Ensure no faulty token is stored
                    router.push('/'); // Redirect to login on error
                } finally {
                    console.log('Device registration process completed');
                    setLoading(false);
                }
            } else {
                // If device token exists, verify the device with the server
                try {
                    const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/device/getAll`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${token}`, // Login token is required for device verification
                            'Device-Authorization': `${deviceToken}`, // Device token is required for device verification
                        },
                    });

                    if (verifyResponse.status === 200) {
                        const result = await verifyResponse.json();
                        if (result.success) {
                            console.log('Device verified successfully');
                            // Continue to dashboard or wherever user was heading
                            localStorage.setItem('devices', JSON.stringify(result.devices));
                        } else {
                            console.log('Device verification failed');
                            localStorage.removeItem('token');
                            localStorage.removeItem('deviceToken');
                            localStorage.removeItem('devices');
                            router.push('/'); // Redirect to login if verification fails
                        }
                    } else {
                        console.log('Error verifying device');
                        localStorage.removeItem('token');
                        localStorage.removeItem('deviceToken');
                        localStorage.removeItem('devices');
                        router.push('/'); // Redirect to login on failure
                    }
                } catch (error) {
                    console.error('Error verifying device:', error);
                    router.push('/'); // Redirect to login on error
                } finally {
                    setLoading(false);
                }
            }
        };

        // Only run device verification if user is authenticated and OTP is verified
        if (!authLoading) {
            verifyDeviceToken();
        }
    }, [userData, isOtpVerified, authLoading, router]);

    return (
        <DeviceContext.Provider value={{ loading }}>
            {children}
        </DeviceContext.Provider>
    );
};