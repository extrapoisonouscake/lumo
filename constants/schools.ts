export enum KnownSchools {
  MarkIsfeld = "xruGQA",
}
export const isKnownSchool = function (school: string): school is KnownSchools {
  return Object.values(KnownSchools).includes(school as any);
};
