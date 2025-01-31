'use client'

import { useState, useContext } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useQRCode } from 'next-qrcode'
import Loader from '@/components/loader'
import { AuthContext } from '@/components/auth-context'
import { ThemeToggle } from '@/components/theme-toggle'
import { useRouter } from 'next/navigation'

export default function TFASetup() {
  const { userData, loading } = useContext(AuthContext)
  const [verificationCode, setVerificationCode] = useState<string>('')
  const { SVG } = useQRCode()
  const router = useRouter()

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value)
  }

  const handleVerify = async () => {
    const token = localStorage.getItem('token')

    // fetch API to verify the code
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/verify_otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify({ otp: verificationCode }),
    });

    if (response.status == 200) {
      const data = await response.json();
        
        // clear the token from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('deviceToken');

        // Save the token in localStorage
        localStorage.setItem('token', data.token);
        
        // Redirect to dashboard
        // window.location.href = '/dashboard';
        router.push('/dashboard')
      
    } else {
      alert('Invalid code. Please try again')
    }
  }

  if (loading || !userData) return <Loader />;

  return (
    <div className="relative flex justify-center items-center min-h-screen">
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set Up Two-Factor Authentication</CardTitle>
          <CardDescription>Scan the QR code or enter the secret key in your authenticator app</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-center">
              <SVG
                text={`otpauth://totp/Connectify:${userData.email}?secret=${userData.TFASecret}&issuer=Connectify&digits=8`}
                options={{
                  margin: 2,
                  width: 150,

                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret-key">Secret Key</Label>
              <Input
                id="secret-key"
                value={userData.TFASecret}
                readOnly
                className="font-mono text-center"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={handleVerificationCodeChange}
                placeholder="Enter the 8-digit code"
              />
            </div>
            <Button className="w-full font-semibold" onClick={handleVerify}>Verify Setup</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}