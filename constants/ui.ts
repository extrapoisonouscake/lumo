import { Transition } from "motion/react";

export const NULL_VALUE_DISPLAY_FALLBACK = "–";
export const UI_ANIMATION_TRANSITION: Transition<any> = {
  duration: 0.15,
  type: "spring",
  stiffness: 200,
  damping: 20,
};
