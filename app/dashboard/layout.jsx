import { DeviceProvider } from '@/components/device-context';
import { AuthProvider } from "@/components/auth-context"

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <DeviceProvider>
        {children}
      </DeviceProvider>
    </AuthProvider>
  );
}
