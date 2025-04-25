import dynamic from "next/dynamic";

export const NotificationsControls = dynamic(
  () => import("./component").then((r) => r.NotificationsControlsComponent),
  {
    ssr: false,
  }
);
