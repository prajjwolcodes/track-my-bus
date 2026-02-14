'use client'

import React, { useState } from 'react'
import { collection, addDoc, Timestamp, doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/firebase'

interface Props {
    onClose: () => void
}

const AddDriver: React.FC<Props> = ({ onClose }) => {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [bus, setBus] = useState('bus1')
    const [photo, setPhoto] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const currentUser = auth.currentUser
            if (!currentUser) throw new Error('User not logged in')

            const userDocRef = doc(db, 'users', currentUser.uid)
            const userSnap = await getDoc(userDocRef)
            if (!userSnap.exists()) throw new Error('User document not found')

            const userData = userSnap.data()
            const schoolId = userData?.schoolId
            if (!schoolId) throw new Error('No schoolId found for this user')

            await addDoc(collection(db, 'drivers'), {
                name,
                phone,
                bus,
                photoName: photo?.name || null,
                schoolId,
                createdAt: Timestamp.now(),
            })

            // To add driver data in user collection
            // await setDoc(doc(db, "users", driverUid), {
            //     role: "driver",
            //     schoolId,      
            //     name,
            //     email,         
            //     phone,
            //     createdAt: serverTimestamp(),
            //   })

            console.log('Driver added successfully!')
            onClose()
        } catch (err) {
            console.error('Error adding driver:', err)
            alert('Failed to add driver: ' + (err as Error).message)
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl w-400px shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Add Driver</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Driver Name"
                        className="border p-2 rounded"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <input
                        type="text"
                        placeholder="Phone Number"
                        className="border p-2 rounded"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />

                    <select
                        className="border p-2 rounded"
                        value={bus}
                        onChange={(e) => setBus(e.target.value)}
                    >
                        <option value="bus1">Bus 1</option>
                        <option value="bus2">Bus 2</option>
                        <option value="bus3">Bus 3</option>
                    </select>

                    <input
                        type="file"
                        className="border p-2 rounded"
                        onChange={(e) => {
                            if (e.target.files) {
                                setPhoto(e.target.files[0])
                            }
                        }}
                    />

                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default AddDriver