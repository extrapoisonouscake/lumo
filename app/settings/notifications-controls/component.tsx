import { updateUserSettingState } from "@/helpers/updateUserSettingsState";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "../../trpc";
import { AsyncSwitchField } from "../async-switch-field";
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isPWA =
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as any).standalone === true;
export function NotificationsControlsComponent({
  initialValue,
}: {
  initialValue: boolean;
}) {
  const subscribeToNotificationsMutation = useMutation(
    trpc.core.settings.subscribeToNotifications.mutationOptions()
  );
  const unsubscribeFromNotificationsMutation = useMutation(
    trpc.core.settings.unsubscribeFromNotifications.mutationOptions()
  );
  const notificationsPermissionDenied =
    window.Notification.permission === "denied";
  const initPush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Push notifications are not supported on this browser");
      return;
    }

    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) return;

    const registration = await registerServiceWorker();
    const subscription = await subscribeToPush(registration);
    const { endpoint, keys } = subscription.toJSON();
    if (!endpoint || !keys) {
      toast.error("Push notifications are not supported on this browser");
      return;
    }
    await subscribeToNotificationsMutation.mutateAsync({
      endpointUrl: endpoint,
      publicKey: keys.p256dh,
      authKey: keys.auth,
    });
  };
  return (
    <div className="flex flex-col gap-2">
      <AsyncSwitchField
        label="Receive notifications"
        disabled={
          notificationsPermissionDenied ||
          (isIOS && !isPWA) ||
          notificationsPermissionDenied
        }
        onChange={async (newValue) => {
          updateUserSettingState("notificationsEnabled", newValue);
          try {
            if (newValue) {
              await initPush();
            } else {
              await unsubscribeFromNotificationsMutation.mutateAsync();
            }
          } catch {
            updateUserSettingState("notificationsEnabled", !newValue);
          }
        }}
        initialValue={initialValue}
        settingKey="notificationsEnabled"
      />
      {notificationsPermissionDenied ? (
        <p className="text-sm text-gray-500">
          Notifications are disabled. Please enable them in your browser
          settings.
        </p>
      ) : isIOS && !isPWA ? (
        <p className="text-sm text-gray-500">
          Install the app to receive notifications.
        </p>
      ) : null}
    </div>
  );
}
const registerServiceWorker = async () => {
  return await navigator.serviceWorker.register("/notifications-sw.js");
};
const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  return permission === "granted";
};
const subscribeToPush = async (registration: ServiceWorkerRegistration) => {
  const convertedVapidKey = urlBase64ToUint8Array(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
  );
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey,
  });
  return subscription;
};
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
