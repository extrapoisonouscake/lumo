import { TitleManager } from "@/components/misc/title-manager";

export default function PrivacyPolicyPage() {
  return (
    <>
      <TitleManager>Privacy Policy for Lumo</TitleManager>
      <main className="mx-auto max-w-3xl px-4 py-10 prose prose-zinc dark:prose-invert">
        <h1 className="text-2xl font-medium">Privacy Policy for Lumo</h1>

        <p>
          <strong>Effective Date:</strong> September 22, 2025
        </p>

        <p>
          At Lumo, your privacy is our priority. This Privacy Policy explains
          how we handle your information when you use our application.
        </p>

        <h2 className="text-lg font-medium">Information We Collect</h2>
        <p>
          Lumo does not permanently collect or store any personally identifiable
          information (PII).
        </p>
        <p>
          To use Lumo, you must sign in with your MyEducationBC account. During
          this process:
        </p>
        <ul>
          <li>
            Your MyEducationBC credentials are securely transmitted to
            MyEducationBC for authentication.
          </li>
          <li>
            Lumo only accesses your login information temporarily to complete
            authentication.
          </li>
          <li>
            Lumo does not store or retain your credentials after they are sent.
          </li>
        </ul>

        <h2 className="text-lg font-medium">Data Storage</h2>
        <p>
          All application data is stored locally on your device. Lumo does not
          store any user data on its servers.
        </p>

        <h2 className="text-lg font-medium">Sharing of Information</h2>
        <p>
          Lumo does not sell, trade, or share your personal information. The
          only data transmission occurs between you and MyEducationBC during
          login.
        </p>

        <h2 className="text-lg font-medium">Third-Party Services</h2>
        <p>
          Your use of MyEducationBC is subject to MyEducationBC’s own Privacy
          Policy and Terms of Service. Lumo does not control how MyEducationBC
          manages your information.
        </p>

        <h2 className="text-lg font-medium">Children’s Privacy</h2>
        <p>
          Lumo does not knowingly collect information from children.
          Authentication and account data are managed by MyEducationBC.
        </p>

        <h2 className="text-lg font-medium">Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Updated versions
          will be available within the app.
        </p>

        <h2 className="text-lg font-medium">Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at:
          <br />
          <a href="mailto:i@gbrv.dev">i@gbrv.dev</a>
        </p>
      </main>
    </>
  );
}
