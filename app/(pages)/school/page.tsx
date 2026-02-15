'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/firebase/firebase'
import { signOut } from 'firebase/auth'
import AddDriver from './AddDriver'
import AddBus from './AddBus'
import BusAssignment from './BusAssignment'

const School = () => {
    const [openDriverModal, setOpenDriverModal] = useState(false)
    const [openBusModal, setOpenBusModal] = useState(false)
    const [openAssignModal, setOpenAssignModal] = useState(false)
    const router = useRouter()

    const handleSignOut = async () => {
        try {
            await signOut(auth)
            router.push('/')
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    const isBlur = openDriverModal || openBusModal || openAssignModal

    return (
        <div className="relative">
            <div className={`${isBlur ? 'blur-sm pointer-events-none' : ''}`}>
                <h1 className="text-2xl font-bold mb-4">School Dashboard</h1>
                <button
                    onClick={() => setOpenDriverModal(true)}
                    className="px-4 py-2 bg-green-900 text-white rounded"
                >
                    Add Driver
                </button>

                <button
                    onClick={() => setOpenBusModal(true)}
                    className="px-4 py-2 m-4 bg-gray-500 text-white rounded"
                >
                    Add Bus
                </button>

                <button
                    onClick={() => setOpenAssignModal(true)}
                    className="px-4 py-2 m-4 bg-indigo-900 text-white rounded"
                >
                    Assignment to Bus
                </button>

                <button
                    onClick={() => router.push("/test")}
                    className="px-4 py-2 m-4 bg-blue-900 text-white rounded"
                >
                    View Data
                </button>

                <button
                    onClick={handleSignOut}
                    className="px-4 py-2 m-4 bg-red-900 text-white rounded hover:bg-red-700 transition"
                >
                    Sign Out
                </button>
            </div>
            {openDriverModal && <AddDriver onClose={() => setOpenDriverModal(false)} />}
            {openBusModal && <AddBus onClose={() => setOpenBusModal(false)} />}
            {openAssignModal && (<BusAssignment onClose={() => setOpenAssignModal(false)} />)}
        </div >
    )
}

export default School