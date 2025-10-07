import { isIOS, isIOSWebView } from "@/constants/ui";
import { callNative, IOSActionBinaryResult } from "@/helpers/ios-bridge";
import { updateUserSettingState } from "@/helpers/updateUserSettingsState";
import { trpc } from "@/views/trpc";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AsyncSwitchField } from "../async-switch-field";
import { IOSNotificationsHelpDrawer } from "./ios-notifications-help-drawer";

//assuming notifications are supported if iOS and not in PWA
const areNotificationsSupported = "Notification" in window || isIOSWebView;
const areNotificationsImplicitlySupported = isIOS || areNotificationsSupported;
export function NotificationsControls({
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
  const [iosNotificationPermission, setIOSNotificationPermission] = useState<
    "granted" | "denied" | "notDetermined"
  >("notDetermined");
  useEffect(() => {
    if (isIOSWebView) {
      callNative("checkNotificationPermission").then((result) => {
        setIOSNotificationPermission(
          result as "granted" | "denied" | "notDetermined"
        );
      });
    }
  }, [isIOSWebView]);
  const notificationsPermissionDenied =
    areNotificationsSupported &&
    (isIOSWebView
      ? iosNotificationPermission
      : window.Notification.permission) === "denied";

  const requestNotificationPermission = async () => {
    if (isIOSWebView) {
      if (iosNotificationPermission === "granted") {
        return true;
      }
      const result = await callNative("requestNotificationPermission");

      return result === "granted";
    } else {
      if (Notification.permission === "granted") {
        return true;
      }
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
  };
  const initPush = async () => {
    if (
      !areNotificationsSupported ||
      (!isIOSWebView &&
        (!("serviceWorker" in navigator) || !("PushManager" in window)))
    ) {
      toast.error("Push notifications are not supported in this browser");
      throw new Error("Unsupported browser");
    }

    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      toast.error(
        `Please allow push notifications in your ${
          isIOSWebView ? "iOS" : "browser"
        }settings.
        }`
      );
      throw new Error("Permission denied");
    }

    if (isIOSWebView) {
      const apnsToken = await callNative<string | "pending">(
        "registerForNotifications"
      );

      if (apnsToken === "pending") {
        toast.error("Please try again later.");
        throw new Error("APNS token not available");
      }

      const result = await callNative<IOSActionBinaryResult>("activateCron");
      if (result === "error") {
        toast.error("Failed to enable notifications. Try again later.");
        throw new Error("Failed to activate cron");
      }
      await subscribeToNotificationsMutation.mutateAsync({
        apnsDeviceToken: apnsToken,
      });
    } else {
      const registration = await waitForServiceWorker();

      const subscription = await getWebPushSubscription(registration);
      const { endpoint, keys } = subscription.toJSON();
      if (!endpoint || !keys) {
        toast.error("Push notifications are not supported in this browser.");
        throw new Error("Unsupported browser");
      }
      await subscribeToNotificationsMutation.mutateAsync({
        endpointUrl: endpoint,
        publicKey: keys.p256dh!,
        authKey: keys.auth!,
      });
    }
  };
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2">
        <AsyncSwitchField
          label="Receive notifications"
          disabled={
            !areNotificationsImplicitlySupported ||
            notificationsPermissionDenied
          }
          checked={checked}
          onChange={async (newValue) => {
            if (notificationsPermissionDenied) {
              return;
            }
            if (!areNotificationsSupported) {
              if (isIOS && !isIOSWebView) {
                setDrawerOpen(true);
              }
              return;
            }

            setChecked(newValue);
            updateUserSettingState("notificationsEnabled", newValue);
            try {
              if (newValue) {
                await initPush();
              } else {
                const promises = [];
                promises.push(
                  unsubscribeFromNotificationsMutation.mutateAsync()
                );
                if (isIOSWebView) {
                  promises.push(
                    new Promise(async (resolve, reject) => {
                      try {
                        await callNative("unregisterFromNotifications");
                        await callNative("deactivateCron");
                        resolve(true);
                      } catch (e) {
                        reject(e);
                      }
                    })
                  );
                }
                await Promise.all(promises);
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
        {!areNotificationsImplicitlySupported && (
          <p className="text-sm text-muted-foreground">
            Notifications are not supported in this browser.
          </p>
        )}
      </div>
      <IOSNotificationsHelpDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
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
const getWebPushSubscription = async (
  registration: ServiceWorkerRegistration
) => {
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
