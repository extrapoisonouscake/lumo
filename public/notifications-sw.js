self.addEventListener("push", (event) => {
  const data = event.data?.json();
  if (!data) return;

  const { notification } = data;

  if (notification?.title === "check_notifications") {
    event.waitUntil(
      (async () => {
        const isAppleDevice = /(Mac|iPhone|iPod|iPad)/i.test(
          navigator.userAgent
        );
        if (isAppleDevice) {
          await self.registration.showNotification(
            "Checking for new assignments...",
            {
              body: data.body || "",
              tag: "hourly-check",
              silent: true,
              requireInteraction: false,
              renotify: false,
              navigate: data.navigate,
              data: { navigate: data.navigate },
            }
          );

          await new Promise((resolve) => setTimeout(resolve, 1000));

          const notifications = await self.registration.getNotifications({
            tag: "hourly-check",
          });
          notifications.forEach((n) => n.close());
        }
        await handleNotificationsHourlyCheck();
      })()
    );
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
