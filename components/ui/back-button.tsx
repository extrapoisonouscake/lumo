import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function BackButton() {
  const router = useRouter();
  const [referrer, setReferrer] = useState<string>();
  useEffect(() => {
    setReferrer(document.referrer);
  }, []);
  return (
    <Link
      href={referrer ?? "/"}
      onClick={() => {
        router.back();
        return false;
      }}
      className="flex items-center gap-1.5 w-fit text-sm hover:opacity-70 transition-opacity"
    >
      <ChevronLeft className="w-4 h-4" />
      Back
    </Link>
  );
}
