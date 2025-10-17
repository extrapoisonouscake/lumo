import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from "@next/third-parties/google";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router";
import NotFoundPage from "./(authenticated)/[...not-found]/page";
import AssignmentPage from "./(authenticated)/classes/[subjectId]/[subjectName]/assignments/[assignmentId]/page";
import SubjectPage from "./(authenticated)/classes/[subjectId]/[subjectName]/page";
import SubjectsLayout from "./(authenticated)/classes/layout";
import SubjectsPage from "./(authenticated)/classes/page";
import GraduationSummaryPage from "./(authenticated)/graduation-summary/page";
import HomePage from "./(authenticated)/home/page";
import AuthenticatedLayout from "./(authenticated)/layout";

import { IOSAppAdvertisement } from "@/components/layout/ios-app-advertisement";
import { CookieRestorationProvider } from "@/components/misc/cookie-restoration-provider";
import { Spinner } from "@/components/ui/button";
import { storage } from "@/helpers/cache";
import { Capacitor } from "@capacitor/core";
import { lazy, Suspense, useEffect } from "react";
import { toast } from "sonner";
import AnnouncementsPage from "./(authenticated)/announcements/page";
import ProfilePage from "./(authenticated)/profile/page";
import SchedulePage from "./(authenticated)/schedule/[[...slug]]/page";
import SettingsPage from "./(authenticated)/settings/page";
import UnauthenticatedLayout from "./(unauthenticated)/layout";
import PrivacyPolicyPage from "./(unauthenticated)/legal/privacy-policy/page";
import LoginPage from "./(unauthenticated)/login/page";

import SupportPage from "./(unauthenticated)/support/page";
import MaintenancePage from "./maintenance/page";
const RegisterPage = lazy(() => import("./(unauthenticated)/register/page"));

export default function Root() {
  useEffect(() => {
    // Clear expired cache keys on startup
    storage.clearExpired();

    if (
      process.env.NODE_ENV === "production" &&
      Capacitor.getPlatform() === "web" &&
      "serviceWorker" in navigator
    ) {
      const serviceWorkerPath = `/sw/sw.js`;

      navigator.serviceWorker
        .register(serviceWorkerPath, { scope: "/" })
        .then((registration) => {
          console.log("Service worker registered");
          // Check for updates periodically
          registration.addEventListener("updatefound", () => {
            console.log("Update found");
            const newWorker = registration.installing;

            if (newWorker) {
              // Show toast only if there's an existing controller (not first install)
              if (navigator.serviceWorker.controller) {
                toast.loading("Updating app...", {
                  description:
                    "Please wait while we update to the latest version.",
                  duration: Infinity,
                  id: "sw-update",
                });
              }

              newWorker.addEventListener("statechange", async () => {
                // Wait for the new worker to be activated instead of just installed
                // This ensures precaching is complete before we reload
                if (
                  newWorker.state === "activated" &&
                  navigator.serviceWorker.controller
                ) {
                  console.log("New service worker activated, reloading...");
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return (
    <>
      <meta
        name="theme-color"
        content="white"
        media="(prefers-color-scheme: light)"
      />
      <div
        className="flex w-full relative justify-center min-h-full pt-[env(safe-area-inset-top,0)]"
        vaul-drawer-wrapper=""
      >
        <CookieRestorationProvider>
          <Providers>
            <Toaster />
            <IOSAppAdvertisement />

            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route element={<AuthenticatedLayout />}>
                  <Route index element={<HomePage />} />
                  <Route element={<AnnouncementsPage />} path="announcements" />
                  <Route element={<SubjectsLayout />} path="classes">
                    <Route index element={<SubjectsPage />} />
                    <Route
                      path=":subjectId/:subjectName"
                      element={<SubjectPage />}
                    />
                    <Route
                      path=":subjectId/:subjectName/assignments/:assignmentId"
                      element={<AssignmentPage />}
                    />
                  </Route>
                  <Route path="schedule">
                    <Route index element={<SchedulePage />} />
                    <Route path=":day" element={<SchedulePage />} />
                  </Route>
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="settings" element={<SettingsPage />} />

                  <Route
                    path="transcript"
                    element={<GraduationSummaryPage />}
                  />
                </Route>
                <Route element={<UnauthenticatedLayout />}>
                  <Route path="login" element={<LoginPage />} />
                  <Route
                    path="register"
                    element={
                      <Suspense fallback={<Spinner />}>
                        <RegisterPage />
                      </Suspense>
                    }
                  />
                </Route>
                <Route path="maintenance" element={<MaintenancePage />} />
                <Route
                  path="legal/privacy-policy"
                  element={<PrivacyPolicyPage />}
                />
                <Route path="support" element={<SupportPage />} />
                <Route path="index.html" element={<Navigate to="/" />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </Providers>
        </CookieRestorationProvider>
        {process.env.NODE_ENV === "production" && (
          <GoogleAnalytics
            gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID!}
          />
        )}
      </div>
    </>
  );
}
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
