export enum KnownSchools {
  MarkIsfeld = "xruGQA",
  GPVanier = "9EKwJv",
}
export const KNOWN_SCHOOL_MYED_NAME_TO_ID:Record<string,KnownSchools>={
 'Ecole Secondaire Mark R. Isfeld Secondary':KnownSchools.MarkIsfeld
}
export const knownSchoolsIDs = Object.values(KnownSchools);
export const isKnownSchool = function (school: string): school is KnownSchools {
  return knownSchoolsIDs.includes(school as any);
};
