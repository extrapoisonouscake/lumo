"use client"

import { Assignment } from "@/types/school";
import { SubjectPageUserSettings } from "./types";
import { SubjectAssignmentsTable } from "./table";
import { useEffect } from "react";
import { MyEdEndpointResponse } from "@/parsing/myed/getMyEd";
import { usePathname } from "next/navigation";

export function SubjectPageContent({subjectId,assignments,...props}: MyEdEndpointResponse<'subjectAssignments'> & SubjectPageUserSettings) {
  const pathname = usePathname();
    useEffect(() => {
        const fragments=pathname.split('/');
        if(!subjectId||fragments.length===4) return
            fragments.push(subjectId);
            window.history.replaceState(null, '', fragments.join('/'));
        
    }, [subjectId]);
  return <SubjectAssignmentsTable
  data={assignments}
  {...props}
/>;
}
export function SubjectPageSkeleton(){

    return <SubjectAssignmentsTable isLoading />;
}