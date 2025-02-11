"use client"
import { createContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isOtpVerified, setIsOtpVerified] = useState(false);


  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');

      // 1. If no token, stay on login
      if (!token) {
        setLoading(false); // Ensure loading state is false to prevent infinite loop
        router.push('/');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/details`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`, // Make sure to add 'Bearer' prefix if required by API
          },
        });

        const result = await response.json();

        console.log("Auth Context Hit")

        if (!result.success) {
          // 2. If token is not valid, redirect to login and clear token
          localStorage.removeItem('token');
          localStorage.removeItem('deviceToken');
          localStorage.removeItem('devices');
          router.push('/');
          return;
        }

        // Set the user data after a successful token verification
        setUserData(result.user);

        // Set the OTP verification status
        setIsOtpVerified(result.isOtpVerified);

        // 3. Check if OTP is verified
        if (!result.isOtpVerified) {
          // 4. Check if TFA is enabled
          if (result.user.isTFAEnabled) {
            // Redirect to TFA verification if TFA is enabled but OTP not verified
            console.log(result.user);
            console.log("Redirecting to TFA Verify from Auth Context")
            router.push('/tfa-verify');
          } else {
            // Redirect to TFA setup if TFA is not enabled
            router.push('/tfa-setup');
          }
        }
        else{
          if (pathname === '/tfa-verify' || pathname === '/tfa-setup' || pathname === '/') {
            // window.location.href = '/dashboard';
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        // Clear the token on error and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('deviceToken');
        localStorage.removeItem('devices');
        router.push('/');
      } finally {
        setLoading(false); // Loading ends after the token check
      }
    };

    verifyToken();
  }, [router]);

  return (
    <AuthContext.Provider value={{ userData, loading, isOtpVerified }}>
      {children}
    </AuthContext.Provider>
  );
};
