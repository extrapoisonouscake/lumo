import { AppleEmoji } from ".";

export function InlineSubjectEmoji({
  emoji,
  whitespaceCount = 2,
}: {
  emoji: string;
  whitespaceCount?: number;
}) {
  return (
    <>
      {Array.from({ length: whitespaceCount }).map((_, index) => (
        <>&nbsp;</>
      ))}
      <AppleEmoji className="inline" value={emoji} />
    </>
  );
}
