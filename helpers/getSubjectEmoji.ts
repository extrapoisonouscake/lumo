import subjectsEmojis from "@/data/subjects-emojis.json";
import "server-only";

export function getSubjectEmoji(name: string) {
  return subjectsEmojis[
    prepareSubjectNameForEmojiRetrieval(name) as keyof typeof subjectsEmojis
  ];
}
export function prepareSubjectNameForEmojiRetrieval(name: string) {
  return name.replace(/\s+\d+(?:\/\d+)*$/, "").toLowerCase();
}
