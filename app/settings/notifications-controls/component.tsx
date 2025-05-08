import { updateUserSettingState } from "@/helpers/updateUserSettingsState";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "../../trpc";
import { AsyncSwitchField } from "../async-switch-field";
import { HelpDrawer } from "./help-drawer";
const { userAgent } = navigator;
const isIOS =
  /iphone|ipad|ipod/i.test(userAgent) ||
  (userAgent.includes("Mac") && "ontouchend" in document);
const isPWA =
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as any).standalone === true;
//assuming notifications are supported if iOS and not in PWA
const areNotificationsSupported = (isIOS && !isPWA) || "Notification" in window;
const areNotificationsAvailable =
  areNotificationsSupported && (!isIOS || isPWA);

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
  const [checked, setChecked] = useState(initialValue);
  const notificationsPermissionDenied =
    areNotificationsAvailable && window.Notification.permission === "denied";
  const initPush = async () => {
    if (
      !areNotificationsSupported ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      toast.error("Push notifications are not supported on this browser");
      throw new Error("Unsupported browser");
    }

    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      toast.error("Please allow push notifications in your browser settings.");
      throw new Error("Permission denied");
    }

    const registration = await waitForServiceWorker();
    const subscription = await subscribeToPush(registration);
    const { endpoint, keys } = subscription.toJSON();
    if (!endpoint || !keys) {
      toast.error("Push notifications are not supported on this browser.");
      throw new Error("Unsupported browser");
    }
    await subscribeToNotificationsMutation.mutateAsync({
      endpointUrl: endpoint,
      publicKey: keys.p256dh!,
      authKey: keys.auth!,
    });
  };
  const [drawerOpen, setDrawerOpen] = useState(false);
  const shouldShowHelpDrawer = isIOS && !isPWA;
  return (
    <>
      <div className="flex flex-col gap-2">
        <AsyncSwitchField
          label="Receive notifications"
          disabled={!areNotificationsSupported || notificationsPermissionDenied}
          checked={checked}
          onChange={async (newValue) => {
            if (newValue === true && shouldShowHelpDrawer) {
              setDrawerOpen(true);
              return;
            }
            setChecked(newValue);
            updateUserSettingState("notificationsEnabled", newValue);
            try {
              if (newValue) {
                await initPush();
              } else {
                await unsubscribeFromNotificationsMutation.mutateAsync();
              }
            } catch (e) {
              console.error(e);
              setChecked(initialValue);
              updateUserSettingState("notificationsEnabled", !newValue);
            }
          }}
          initialValue={initialValue}
          settingKey="notificationsEnabled"
        />
        {notificationsPermissionDenied && (
          <p className="text-sm text-muted-foreground">
            The permission to receive notifications has been denied. Please
            grant it in the browser settings.
          </p>
        )}
        {!areNotificationsSupported && (
          <p className="text-sm text-muted-foreground">
            Notifications are not supported on this browser.
          </p>
        )}
      </div>
      <HelpDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
const SW_PATH = "/notifications-sw.js";
const waitForServiceWorker = async () => {
  let registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    registration = await navigator.serviceWorker.register(SW_PATH);
  }
  await navigator.serviceWorker.ready;
  return registration;
};
const requestNotificationPermission = async () => {
  if (Notification.permission === "granted") {
    return true;
  }
  const permission = await Notification.requestPermission();
  return permission === "granted";
};
const subscribeToPush = async (registration: ServiceWorkerRegistration) => {
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    const convertedVapidKey = urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    );
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
  }
  return subscription;
};
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
