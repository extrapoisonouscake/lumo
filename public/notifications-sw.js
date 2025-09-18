self.addEventListener("push", (event) => {
  const data = event.data?.json();

  if (data.title && data.body) {
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
      })
    );
    return;
  }
  if (data.checkNotifications) {
    event.waitUntil(handleNotificationsHourlyCheck());
    return;
  }
});
async function handleNotificationsHourlyCheck() {
  await fetch("/api/notifications/check", { method: "POST" });
}

// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();
//   event.waitUntil(
//     clients.openWindow("/notif")
//   );
// });

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});
