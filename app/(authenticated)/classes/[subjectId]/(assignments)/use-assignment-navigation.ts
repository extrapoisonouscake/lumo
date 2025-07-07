import { Assignment } from "@/types/school";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { getAssignmentURL } from "./helpers";

export function useAssignmentNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const navigateToAssignment = (assignment: Assignment) => {
    router.push(getAssignmentURL(pathname, assignment));
  };

  return { navigateToAssignment };
}
