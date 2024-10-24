"use client"
import { AuthContext } from '@/components/auth-context'
import { useState, useContext } from "react"



export default function DashboardPage() {
    const { loading, userData } = useContext(AuthContext)

    if (loading) return <p>Loading...</p>

    if (!userData) {
        alert("You are not logged in")
    }
    
    return (
        <div>
            <h1>Dashboard</h1>
            <p>This is the dashboard page</p>
        </div>
    )
}
