'use client'

import NotificationCard from '@/components/NotificationCard'
import React from 'react'

const test = () => {
    const notification = {
        id: '1',
        title: "Your bus has arrived!",
        body: "The bus you were waiting for has just arrived at your stop. Please proceed to board the bus.",
        icon: null,
        source: 'Smart Yatra',
    };
    const onClose = (id: string) => {
        console.log(`Notification with id ${id} closed.`);
    }
    return (
        <div>
            <NotificationCard notification={notification} onClose={onClose} />
        </div>
    )
}

export default test