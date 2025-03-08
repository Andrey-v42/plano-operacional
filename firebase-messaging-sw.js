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

// messaging.onBackgroundMessage((payload) => {
//     console.log("Background message received:", payload);

//     // Extract notification details
//     const { title, body } = payload.notification;

//     // Show the notification
//     self.registration.showNotification(title, {
//         body,
//         icon: "logos/logo_zig_blue.png", // Update with your app's icon
//         requireInteraction: true, // Keeps the notification open until user interacts
//     });
// });

messaging.onBackgroundMessage((payload) => {
    console.log(
      '[firebase-messaging-sw.js] Received background message ',
      payload
    );
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: 'logos/logo_zig_blue.png'
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  });