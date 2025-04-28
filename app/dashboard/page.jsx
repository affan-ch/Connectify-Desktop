'use client'

import { AuthContext } from '@/components/auth-context'
import { useState, useContext, useEffect } from "react"
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
    const { loading, userData } = useContext(AuthContext)
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (!userData) {
                alert("You are not logged in")
            }
            // Redirect after checking auth
            router.push('/dashboard/chat')
        }
    }, [loading, userData, router])

    if (loading) return <p>Loading...</p>

    // Optionally render nothing because user will be redirected
    return null
}
