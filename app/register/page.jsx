"use client"

import { useState } from "react"
import Link from "next/link"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"


export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = (event) => {
        event.preventDefault()

        // get name, email, password
        const name = event.target.name.value
        const email = event.target.email.value
        const password = event.target.password.value

        // verify all fields are filled
        if (!name || !email || !password) {
            alert("Please fill in all fields")
            return
        }

        // verify name length
        if (name.length < 3) {
            alert("Name must be at least 3 characters long")
            return
        }

        // verify password length
        if (password.length < 10) {
            alert("Password must be at least 10 characters long")
            return
        }

        // verify email by regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address")
            return
        }

        // verify password by regex
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{10,}$/
        if (!passwordRegex.test(password)) {
            alert("Password must have atleast 1 special character, 1 upper case letter, 1 lower case letter and 1 number")
            return
        }

        // make a POST request
        fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Success:', data)
                // redirect to login page
                alert("Account Created Successfully");
                window.location.href = '/'
            })
            .catch((error) => {
                console.error('Error:', error);
                alert("An error occurred. Please try again later.");
            })
    }

    return (
        <div className='relative flex h-screen'>
            <div className='absolute top-4 right-4'>
                <ThemeToggle />
            </div>
            <Card className="w-1/4 m-auto min-w-[350px]">
                <CardHeader>
                    <CardTitle className='text-2xl font-bold'>Sign Up</CardTitle>
                    <CardDescription>Create a new account to get started</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Enter your name" required />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="Enter your email" required />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
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
                            Sign Up
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/" className="text-primary hover:underline">
                            Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}