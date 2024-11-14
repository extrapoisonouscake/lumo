import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="">
      <Button asChild>
        <Link href="/classes">Classes</Link>
      </Button>
      <Button asChild>
        <Link href="/schedule">Schedule</Link>
      </Button>
    </div>
  );
}
