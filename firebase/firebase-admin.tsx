import admin from "firebase-admin";
var serviceAccount = require("@/lib/track-my-bus-admin-sdk.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_rtdb_databaseURL
    });
}

export const adminMessaging = admin.messaging()
