'use client'

import { useState, useRef, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, User } from "lucide-react"
import { AuthContext } from '@/components/auth-context'
import Loader from '@/components/loader'
import { ThemeToggle } from '@/components/theme-toggle'

export default function VerifyOTP() {
  const { userData, loading } = useContext(AuthContext)
  const [otp, setOtp] = useState<string[]>(Array(8).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [trustDevice, setTrustDevice] = useState(true)
  const router = useRouter()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Move loading check to render phase instead of early return
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (error) setError(null)
    if (value.length > 1) value = value.slice(-1)
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    if (/^\d{8}$/.test(pastedData)) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      inputRefs.current[7]?.focus()
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 8) {
      setError('Please enter an 8-digit verification code')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')

      // fetch API to verify the code
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/verify_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({ otp: otpString }),
      });

      if (response.ok) {
        // Redirect to dashboard if verification is successful
        console.log('Verification successful');
        console.log(response.body)
        router.push('/dashboard')
      } else {
        // Handle error
        console.log('Verification failed');
        setError('Invalid verification code. Please try again.')
        setOtp(Array(8).fill(''))
        inputRefs.current[0]?.focus()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsVerifying(false)
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
          <CardTitle>Verify Authenticator Code</CardTitle>
          <CardDescription>Enter the 6-digit code from your authenticator app</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar>
              <AvatarImage src={userData.avatarUrl} alt={userData.name} />
              <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{userData.name}</div>
              <div className="text-sm text-gray-500">{userData.email}</div>
            </div>
          </div>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp-0">Enter verification code</Label>
              <div className="flex gap-2 flex-wrap justify-center">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    ref={(el) => { inputRefs.current[index] = el }}
                    className="w-10 h-12 text-center text-xl"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="trust-device"
                checked={trustDevice}
                onCheckedChange={(checked) => setTrustDevice(checked as boolean)}
              />
              <Label htmlFor="trust-device">Trust this device</Label>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full font-semibold" disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying
                </>
              ) : (
                'Verify'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
