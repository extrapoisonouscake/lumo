import { AppSidebarWrapper } from "@/components/layout/app-sidebar-wrapper";
import { isIOSApp } from "@/constants/ui";
import { WEBSITE_ROOT } from "@/constants/website";
import { clientAuthChecks } from "@/helpers/client-auth-checks";
import { setThemeColorCSSVariable } from "@/helpers/theme";
import { updateUserSettingState } from "@/helpers/updateUserSettingsState";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { Preferences } from "@capacitor/preferences";
import { PushNotifications } from "@capacitor/push-notifications";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { initPush } from "./settings/notifications-controls";
import { reconcileMobileAppIcon } from "./settings/theme-picker";
const HAS_PROMPTED_FOR_NOTIFICATIONS_PREFERENCE_KEY =
  "hasPromptedForNotifications";

export default function AuthenticatedLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const isLoggedIn = clientAuthChecks.isLoggedIn();
  const settings = useUserSettings();
  useEffect(() => {
    setThemeColorCSSVariable(settings.themeColor);
    reconcileMobileAppIcon(settings.themeColor);
  }, [settings.themeColor]);

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  useEffect(() => {
    if (isIOSApp) {
      import("@aparajita/capacitor-ios-silent-notifications").then(
        ({ IosSilentNotifications }) => {
          IosSilentNotifications.addListener(
            "onSilentNotification",
            (notification: Notification) => {
              fetch(`${WEBSITE_ROOT}/api/notifications/check`, {
                method: "POST",
              }).then();
            }
          );
        }
      );
      if (!settings.notificationsEnabled) {
        Promise.all([
          PushNotifications.checkPermissions(),
          Preferences.get({
            key: HAS_PROMPTED_FOR_NOTIFICATIONS_PREFERENCE_KEY,
          }),
        ]).then(([{ receive }, { value: hasPromptedForNotifications }]) => {
          if (receive === "denied" || hasPromptedForNotifications === "true") {
            return;
          }
          initPush(
            () =>
              PushNotifications.requestPermissions().then(
                ({ receive }) => receive === "granted"
              ),
            true
          )()
            .then(() => {
              console.log("Notifications requested successfully");
              updateUserSettingState("notificationsEnabled", true);
            })
            .catch((error) => {
              console.error("Error requesting notifications:", error);
            })
            .finally(() => {
              Preferences.set({
                key: HAS_PROMPTED_FOR_NOTIFICATIONS_PREFERENCE_KEY,
                value: "true",
              });
            });
        });
      }
    }
  }, []);
  const sidebarState = Cookies.get("sidebar:state");
  const isSidebarExpanded = sidebarState ? sidebarState === "true" : true;
  return (
    <AppSidebarWrapper initialIsExpanded={isSidebarExpanded}>
      {children ?? <Outlet />}
    </AppSidebarWrapper>
  );
}
