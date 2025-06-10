import { IS_LOGGED_IN_COOKIE_NAME } from "@/constants/auth";
import Cookies from "js-cookie";
export const clientAuthChecks = {
  isLoggedIn() {
    return Cookies.get(IS_LOGGED_IN_COOKIE_NAME) === "true";
  },
};
