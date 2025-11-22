import { Logo } from "@/components/misc/logo";
import { TitleManager } from "@/components/misc/title-manager";
import { DEVELOPER_EMAIL, WEBSITE_TITLE } from "@/constants/website";
import { Link } from "react-router";

export default function PrivacyPolicyPage() {
  return (
    <>
      <TitleManager>Privacy Policy for {WEBSITE_TITLE}</TitleManager>
      <div className="flex flex-col items-center min-h-screen p-4 sm:p-6">
        <div className="w-full max-w-3xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              to="/login"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Logo className="size-5 text-brand" />
              <span>Back to Sign In</span>
            </Link>
          </div>

          {/* Content */}
          <main className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <h1 className="text-4xl font-medium">Privacy Policy</h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Effective Date:{" "}
                <span className="text-primary">November 21, 2025</span>
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">
                At {WEBSITE_TITLE}, your privacy is our priority. This Privacy
                Policy explains how we handle your information when you use our
                application.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Information We Collect</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                {WEBSITE_TITLE} does not permanently collect or store any
                personally identifiable information (PII).
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">
                To use {WEBSITE_TITLE}, you must sign in with your MyEducationBC
                account. During this process:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>
                  Your MyEducationBC credentials are securely transmitted to
                  MyEducationBC for authentication.
                </li>
                <li>
                  {WEBSITE_TITLE} only accesses your login information
                  temporarily to complete authentication.
                </li>
                <li>
                  {WEBSITE_TITLE} does not store or retain your credentials
                  after they are sent.
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Data Storage</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                All application data is stored locally on your device.{" "}
                {WEBSITE_TITLE} does not store any user data on its servers.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Sharing of Information</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                {WEBSITE_TITLE} does not sell, trade, or share your personal
                information. The only data transmission occurs between you and
                MyEducationBC during login.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Third-Party Services</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Your use of MyEducationBC is subject to MyEducationBC's own
                Privacy Policy and{" "}
                <Link
                  to="/legal/terms-of-service"
                  className="text-primary hover:underline"
                >
                  Terms of Service
                </Link>
                . {WEBSITE_TITLE} does not control how MyEducationBC manages
                your information.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Children's Privacy</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                {WEBSITE_TITLE} does not knowingly collect information from
                children. Authentication and account data are managed by
                MyEducationBC.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Changes to This Policy</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                We may update this Privacy Policy from time to time. Updated
                versions will be available within the app.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Contact Us</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                If you have any questions about this Privacy Policy, please
                contact us at:
                <a
                  href={`mailto:${DEVELOPER_EMAIL}`}
                  className="text-primary hover:underline"
                >
                  {DEVELOPER_EMAIL}
                </a>
              </p>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
