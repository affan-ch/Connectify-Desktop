"use client"
import { useContext } from 'react';
import { AuthContext } from '@/components/auth-context';
import Loader from '@/components/loader';

export default function Dashboard() {
    const { userData, loading } = useContext(AuthContext);

    if (loading) {
        return <Loader />;
    }

    if (!userData) {
        return <Loader />;
    }

    return (
        <div>
            {userData ? (
                <div>
                    <h1>Welcome {userData.name}</h1>
                    <p>Email: {userData.email}</p>
                </div>
            ) : (
                <Loader />
            )}
        </div>
    );

}