import { isIOSWebView } from "@/constants/ui";

// Bridge.js
let _callbackId = 0;
const callbacks: Record<string, (result: any) => void> = {};
type IOSAction =
  | "checkNotificationPermission"
  | "requestNotificationPermission"
  | "getAppTheme"
  | "setAppTheme"
  | "storeEncryptedCookies"
  | "saveAuthData"
  | "logoutWipe"
  | "activateCron"
  | "deactivateCron"
  | "scheduleNotification"
  | "unscheduleNotification"
  | "registerForNotifications"
  | "unregisterFromNotifications";
export type IOSActionBinaryResult = "ok" | "error";
export function callNative<T>(action: IOSAction, payload: any = {}) {
  if (!isIOSWebView) throw new Error("Cannot call native on non-iOS device");
  return new Promise<T>((resolve, reject) => {
    const callbackName = `__cb${_callbackId++}`;
    callbacks[callbackName] = resolve;

    // Attach callback name to payload
    const message = { action, ...payload, callbackName };

    // Send to native
    window.webkit.messageHandlers.native.postMessage(message);
  });
}

// Called by iOS
function nativeCallback(callbackName: string, result: any) {
  if (callbacks[callbackName]) {
    callbacks[callbackName](result);
    delete callbacks[callbackName];
  }
}

// Defer assignment until window is available
if (typeof window !== "undefined") {
  window.__nativeCallback = nativeCallback;
}
