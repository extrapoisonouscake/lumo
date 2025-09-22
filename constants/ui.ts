import { Transition } from "motion/react";

export const NULL_VALUE_DISPLAY_FALLBACK = "–";
export const UI_ANIMATION_TRANSITION: Transition<any> = {
  duration: 0.15,
  type: "spring",
  stiffness: 200,
  damping: 20,
};
const { userAgent } = navigator;
export const isIOS =
  /iphone|ipad|ipod/i.test(userAgent) ||
  (userAgent.includes("Mac") && "ontouchend" in document);

export const isIOSWebView = isIOS && !!window.webkit;
