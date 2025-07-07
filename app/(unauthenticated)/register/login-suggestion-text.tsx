import Link from "next/link";

export function LoginSuggestionText() {
  return (
    <Link
      href="/login"
      className="text-center text-sm text-secondary-foreground"
    >
      Already have an account?
    </Link>
  );
}
