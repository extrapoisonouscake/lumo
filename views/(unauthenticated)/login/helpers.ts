import { refreshSessionExpiresAt } from "@/views/trpc";
import { useNavigate } from "react-router";

export const initClientLogin = (push: ReturnType<typeof useNavigate>) => {
  refreshSessionExpiresAt();
  push("/");
};
