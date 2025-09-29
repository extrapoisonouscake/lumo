import { Link } from "react-router";

export function LoginSuggestionText() {
  return (
    <Link to="/login" className="text-center text-sm text-secondary-foreground">
      Already have an account?
    </Link>
  );
}
