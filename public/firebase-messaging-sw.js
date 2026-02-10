

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyCFNApzNuLobTFWjQ1gR-fD4BG_hVL12HY",
    authDomain: "track-my-bus-dde0a.firebaseapp.com",
    projectId: "track-my-bus-dde0a",
    messagingSenderId: "857920078278",
    appId: "1:857920078278:web:1d4744d45f21affc0832c7",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(async (payload) => {
    const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
    });

    const openTitle = payload.data?.tabOpenTitle || "Bus Update";
    const openBody = payload.data?.tabOpenBody || "New update received";
    const closedTitle = payload.data?.tabClosedTitle || "Bus Update";
    const closedBody = payload.data?.tabClosedBody || "New update received";
    const icon = payload.notification?.icon || payload.data?.icon;

    if (allClients.length > 0) {
        // If any tab is open, send the data to the page and let it show an alert.
        allClients.forEach((client) => {
            client.postMessage({
                type: "FCM_ALERT",
                data: {
                    tabOpenTitle: openTitle,
                    tabOpenBody: openBody,
                    icon,
                },
            });
        });
        return;
    }

    // No tab open: show a real notification.
    await self.registration.showNotification(closedTitle, {
        body: closedBody,
        icon,
    });
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
            for (const client of clientsArr) {
                if ("focus" in client) {
                    return client.focus();
                }
            }
            return self.clients.openWindow("/");
        })
    );
});

