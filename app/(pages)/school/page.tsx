'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/firebase/firebase'
import { signOut } from 'firebase/auth'
import AddDriver from './AddDriver'

const School = () => {
    const [openModal, setOpenModal] = useState(false)
    const router = useRouter()

    const handleSignOut = async () => {
        try {
            await signOut(auth)
            router.push('/')
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    return (
        <div className="relative">
            <div className={`${openModal ? 'blur-sm pointer-events-none' : ''}`}>
                <h1 className="text-2xl font-bold mb-4">School Dashboard</h1>
                <button
                    onClick={() => setOpenModal(true)}
                    className="px-4 py-2 bg-green-900 text-white rounded"
                >
                    Add Driver
                </button>

                <button
                    onClick={handleSignOut}
                    className="px-4 py-2 m-4 bg-red-900 text-white rounded hover:bg-red-700 transition"
                >
                    Sign Out
                </button>
        </div>
            { openModal && <AddDriver onClose={() => setOpenModal(false)} /> }
        </div >
    )
}

export default School