import { Logo } from "@/components/misc/logo";
import { TitleManager } from "@/components/misc/title-manager";
import { DEVELOPER_EMAIL, WEBSITE_TITLE } from "@/constants/website";
import { Link } from "react-router";

export default function TermsOfServicePage() {
  return (
    <>
      <TitleManager>Terms of Service for {WEBSITE_TITLE}</TitleManager>
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
              <h1 className="text-4xl font-medium">Terms of Service</h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                <strong>Effective Date:</strong> September 22, 2025
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">
                Welcome to {WEBSITE_TITLE}. By accessing or using our service,
                you agree to be bound by these Terms of Service. If you disagree
                with any part of these terms, please do not use our service.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Acceptance of Terms</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                By using {WEBSITE_TITLE}, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service and
                our{" "}
                <Link
                  to="/legal/privacy-policy"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Service Description</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                {WEBSITE_TITLE} is an application that provides access to your
                MyEducationBC educational data. The service requires
                authentication through your MyEducationBC account credentials.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">User Responsibilities</h2>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>
                  You are responsible for maintaining the confidentiality of
                  your MyEducationBC account credentials.
                </li>
                <li>
                  You agree not to share your account credentials with any third
                  party.
                </li>
                <li>
                  You are responsible for all activities that occur under your
                  account.
                </li>
                <li>
                  You agree to use the service only for lawful purposes and in
                  accordance with these Terms.
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Acceptable Use</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>
                  Use the service in any way that violates any applicable law or
                  regulation.
                </li>
                <li>
                  Attempt to gain unauthorized access to any portion of the
                  service or any other systems or networks.
                </li>
                <li>
                  Interfere with or disrupt the service or servers connected to
                  the service.
                </li>
                <li>
                  Use any automated system, including robots or scrapers, to
                  access the service.
                </li>
                <li>
                  Reverse engineer, decompile, or disassemble any part of the
                  service.
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Data and Privacy</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                All data is stored locally on your device. {WEBSITE_TITLE} does
                not store your personal information on our servers. For more
                information about how we handle your data, please review our{" "}
                <Link
                  to="/legal/privacy-policy"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Third-Party Services</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                {WEBSITE_TITLE} integrates with MyEducationBC for authentication
                and data access. Your use of MyEducationBC is subject to
                MyEducationBC's own Terms of Service and Privacy Policy.{" "}
                {WEBSITE_TITLE} is not affiliated with, endorsed by, or
                sponsored by the Government of British Columbia or
                MyEducationBC.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Service Availability</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                We strive to provide reliable service, but we do not guarantee
                that the service will be available at all times. The service may
                be temporarily unavailable due to maintenance, updates, or
                circumstances beyond our control.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Limitation of Liability</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                {WEBSITE_TITLE} is provided "as is" and "as available" without
                warranties of any kind, either express or implied. To the
                fullest extent permitted by law, we disclaim all warranties,
                including implied warranties of merchantability, fitness for a
                particular purpose, and non-infringement.
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">
                In no event shall {WEBSITE_TITLE} or its operators be liable for
                any indirect, incidental, special, consequential, or punitive
                damages, including loss of data, arising from your use of the
                service.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">
                Educational Data Accuracy
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                {WEBSITE_TITLE} displays data retrieved from MyEducationBC. We
                do not guarantee the accuracy, completeness, or timeliness of
                this data. You should verify important information directly with
                your educational institution or MyEducationBC.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Intellectual Property</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                The {WEBSITE_TITLE} service, including its design, features, and
                functionality, is owned by the service operators and is
                protected by copyright, trademark, and other intellectual
                property laws.
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">
                MyEducationBC is a trademark of the Government of British
                Columbia. The MyEducationBC logo is used solely to indicate
                authentication integration compatibility and does not imply
                affiliation with or endorsement by the Government of British
                Columbia.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Termination</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                We reserve the right to terminate or suspend your access to the
                service at any time, with or without cause or notice, for any
                reason, including violation of these Terms.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Changes to Terms</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                We reserve the right to modify these Terms of Service at any
                time. Updated versions will be posted on this page with an
                updated effective date. Your continued use of the service after
                changes constitutes acceptance of the modified terms.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">Contact Us</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                If you have any questions about these Terms of Service, please
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
