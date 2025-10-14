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
import { storage } from "@/helpers/cache";
import { useEffect } from "react";
import AnnouncementsPage from "./(authenticated)/announcements/page";
import ProfilePage from "./(authenticated)/profile/page";
import SchedulePage from "./(authenticated)/schedule/[[...slug]]/page";
import SettingsPage from "./(authenticated)/settings/page";
import UnauthenticatedLayout from "./(unauthenticated)/layout";
import PrivacyPolicyPage from "./(unauthenticated)/legal/privacy-policy/page";
import LoginPage from "./(unauthenticated)/login/page";
import RegisterPage from "./(unauthenticated)/register/page";
import SupportPage from "./(unauthenticated)/support/page";
import MaintenancePage from "./maintenance/page";
export default function Root() {
  useEffect(() => {
    //checking if any of the keys are expired
    Object.keys(localStorage).forEach(storage.get);
  }, []);
  return (
    <>
      <meta
        name="theme-color"
        content="white"
        media="(prefers-color-scheme: light)"
      />
      <div
        className="flex w-full justify-center min-h-full pt-[env(safe-area-inset-top,0)]"
        vaul-drawer-wrapper="true"
      >
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

                <Route path="graduation" element={<GraduationSummaryPage />} />
              </Route>
              <Route element={<UnauthenticatedLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
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
