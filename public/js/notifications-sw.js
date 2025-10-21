self.addEventListener("push", (event) => {
  const data = event.data?.json();
  if (!data) return;

  const { notification } = data;

  if (notification?.title === "check_notifications") {
    const isAppleDevice = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent);
    if (!isAppleDevice) {
      event.waitUntil(handleNotificationsHourlyCheck);
    }
  } else {
    event.waitUntil(
      self.registration.showNotification(notification.title, {
        body: notification.body,
        navigate: notification.navigate,
      })
    );
  }
});

async function handleNotificationsHourlyCheck() {
  await fetch("/api/notifications/check", { method: "POST" });
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});
