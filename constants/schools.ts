export enum KnownSchools {
  MarkIsfeld = "xruGQA",
  GPVanier = "9EKwJv",
}
export const knownSchoolsIDs = Object.values(KnownSchools);
export const isKnownSchool = function (school: string): school is KnownSchools {
  return knownSchoolsIDs.includes(school as any);
};
