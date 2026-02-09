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

messaging.onBackgroundMessage(function (payload) {
    console.log("[firebase-messaging-sw.js] Background message ", payload);

    // Works whether you send `notification` OR `data`
    const title =
        payload.notification?.title || payload.data?.title || "Bus Update";

    const body =
        payload.notification?.body || payload.data?.body || "New update received";

    self.registration.showNotification(title, {
        body,
        icon: "https://imgs.search.brave.com/JzzQ3hCqNrreZIasRtxZW_E2IAU9mv4nEo_dSawUQlQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA2Lzk2LzU1Lzk0/LzM2MF9GXzY5NjU1/OTQ2Ml9vc0VRUXhC/RmJNamRsRWNpRlpJ/bUNFRE15SVJRYUdh/Zy5qcGc",
    });
});
