importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

self.addEventListener("push", function () { });
self.addEventListener("notificationclick", function () { });

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
    console.log("Payload notification body:", payload);

    self.registration.showNotification(
        payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.image,
    });
});
