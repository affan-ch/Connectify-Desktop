"use client"
import { AuthContext } from '@/components/auth-context'
import { useState, useContext } from "react"


export default function DashboardPage() {
    const { loading, userData } = useContext(AuthContext)

    if (loading) return <p>Loading...</p>

    if (!userData) {
        alert("You are not logged in")
    }

    // redirect to /dasboard/chat
    window.location.href = '/dashboard/chat';
    
    return (
        <div>
            
        </div>
    )
}