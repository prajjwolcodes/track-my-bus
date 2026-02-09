import admin from "firebase-admin";

var serviceAccount = require("../public/firebase-admin-sdk.json");




if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://track-my-bus-dde0a-default-rtdb.firebaseio.com"
    });
}

export const adminMessaging = admin.messaging();
