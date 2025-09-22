export default function SupportPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-zinc dark:prose-invert">
      <h1 className="text-2xl font-medium">Lumo Support</h1>

      <p>
        Welcome to Lumo Support. If you need help with the app or website, you
        can reach us using the contact details below.
      </p>

      <h2 className="text-lg font-medium">Contact</h2>
      <ul>
        <li>
          Email: <a href="mailto:i@gbrv.dev">i@gbrv.dev</a>
        </li>
      </ul>

      <h2 className="text-lg font-medium">Common Questions</h2>
      <h3>Can&apos;t log in to MyEducationBC</h3>
      <p>
        Lumo uses your existing MyEducationBC credentials for authentication. If
        you can&apos;t log in, please verify your username and password at the
        official MyEducationBC portal. If the issue persists, contact us with
        details.
      </p>

      <h3>Data and privacy</h3>
      <p>
        Lumo does not store personal data on our servers. For full details,
        please see our <a href="/legal/privacy-policy">Privacy Policy</a>.
      </p>

      <h3>Feature requests or bug reports</h3>
      <p>
        We welcome feedback. Please email{" "}
        <a href="mailto:i@gbrv.dev">i@gbrv.dev</a> with a clear description,
        screenshots if possible, and steps to reproduce.
      </p>

      <h2 className="text-lg font-medium">App Information</h2>
      <ul>
        <li>App name: Lumo</li>
        <li>Platform: iOS/Web</li>
        <li>Primary language: English (Canada)</li>
      </ul>

      <h2 className="text-lg font-medium">Account or Data Deletion</h2>
      <p>
        Lumo does not maintain user accounts or store personal data on our
        servers. If you wish to remove locally stored data, you can delete the
        app from your device. For any questions, contact{" "}
        <a href="mailto:i@gbrv.dev">i@gbrv.dev</a>.
      </p>
    </main>
  );
}
