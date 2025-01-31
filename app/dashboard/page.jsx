"use client"
import { AuthContext } from '@/components/auth-context'
import { useState, useContext } from "react"
import { useRouter } from 'next/navigation'


export default function DashboardPage() {
    const { loading, userData } = useContext(AuthContext)
    const router = useRouter()

    if (loading) return <p>Loading...</p>

    if (!userData) {
        alert("You are not logged in")
    }

    // redirect to /dasboard/chat
    // window.location.href = '/dashboard/chat';
    router.push('/dashboard/chat')
    
    return (
        <div>
            
        </div>
    )
}