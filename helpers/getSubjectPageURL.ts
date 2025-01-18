import { Subject } from "@/types/school"
import { prepareStringForURI } from "./prepareStringForURI"

export const getSubjectPageURL=(subject:Pick<Subject,"name"|"id">)=>{
  return `/classes/${prepareStringForURI(subject.name)}/${subject.id}`
}