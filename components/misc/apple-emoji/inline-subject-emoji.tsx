import { PropsWithChildren } from "react";
import { AppleEmoji } from ".";

export function InlineSubjectEmoji({
  emoji,
}: PropsWithChildren<{ emoji: string }>) {
  return (
    <>
      &nbsp;&nbsp;
      <AppleEmoji className="inline" value={emoji} />
    </>
  );
}
