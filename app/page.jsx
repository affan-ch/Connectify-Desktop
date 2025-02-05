"use client"
import { ThemeToggle } from '@/components/theme-toggle'
import { useState, useContext } from "react"
import Link from "next/link"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthContext } from '@/components/auth-context'
import Loader from '@/components/loader'
import { useRouter } from 'next/navigation'
import TrayManager from "@/lib/tray";

export default function LoginPage() {

  const { loading, isOtpVerifed } = useContext(AuthContext)
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter()

  if (loading) return <Loader />;

  if (isOtpVerifed) {
    // window.location.href = '/dashboard'
    router.push('/dashboard')

  }

  const handleSubmit = (event) => {
    event.preventDefault()
    // Add your login logic here
    const email = event.target.email.value
    const password = event.target.password.value

    // make a POST request to your API
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data)
        const token = data['token']
        localStorage.setItem('token', token)

        const isTFAEnabled = data['isTFAEnabled']

        // Ensure token is set in localStorage, then redirect
        if (localStorage.getItem('token')) {
          if (isTFAEnabled) {
            // window.location.href = '/tfa-verify'
            router.push('/tfa-verify')
          }
          else {
            // window.location.href = '/tfa-setup'
            router.push('/tfa-setup')
          }
        }
      })
      .catch((error) => {
        console.error('Error:', error)
      });

    console.log("Login submitted")
  }


  return (
    <div className='relative flex h-screen'>
      <TrayManager />
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>
      <Card className="w-1/4 m-auto min-w-[350px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" required />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <Button className="w-full mt-4 font-semibold" type="submit">
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>

  )
}