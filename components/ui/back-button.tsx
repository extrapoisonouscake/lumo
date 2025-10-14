import { cn } from "@/helpers/cn";
import { ArrowLeft01StrokeSharp } from "@hugeicons-pro/core-stroke-sharp";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

export function BackButton({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [referrer, setReferrer] = useState<string>();
  useEffect(() => {
    setReferrer(document.referrer);
  }, []);
  return (
    <Link
      to={referrer ?? "/"}
      onClick={() => {
        navigate(-1);
        return false;
      }}
      className={cn(
        "flex items-center gap-1.5 w-fit text-sm hover:opacity-70 transition-[opacity,scale] active:scale-95",
        className
      )}
    >
      <HugeiconsIcon icon={ArrowLeft01StrokeSharp} className="w-4 h-4" />
      Back
    </Link>
  );
}
