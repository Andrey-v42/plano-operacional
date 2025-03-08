importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyBKQF6jcCt6tStVuoDxf-kXE_7IDPiPI_s",
    authDomain: "zops-mobile.firebaseapp.com",
    projectId: "zops-mobile",
    messagingSenderId: "1081327598072",
    appId: "1:1081327598072:web:59ea9ad933f2a8cc0ebe0d",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("Background message received:", payload);

    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: "logos/logo_zig_blue.png",
    });
});