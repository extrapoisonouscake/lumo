import { ErrorAlert } from "@/components/ui/error-alert";
import { UI_ANIMATION_TRANSITION } from "@/constants/ui";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function useFormErrorMessage(initialErrorMessage?: string | null) {
  const [errorMessage, setErrorMessage] = useState<string | null | undefined>(
    initialErrorMessage ?? null
  );

  const node = (
    <AnimatePresence mode="wait">
      {errorMessage ? (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto", marginBottom: 12 }}
          exit={{
            opacity: 0,
            y: -10,
            height: 0,
            marginBottom: 0,
            transition: {
              ease: "easeInOut",
              duration: 0.25,
            },
          }}
          transition={UI_ANIMATION_TRANSITION}
        >
          <ErrorAlert>{errorMessage}</ErrorAlert>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
  return {
    errorMessage,
    setErrorMessage,
    errorMessageNode: node,
  };
}
