"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLocation } from "react-router";

export default function TransitionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className="size-full"
        initial={{ transform: "scale(0.99)", opacity: 0 }}
        animate={{ transform: "scale(1)", opacity: 1 }}
        transition={{ ease: "easeInOut", duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
