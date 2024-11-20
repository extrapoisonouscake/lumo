import { ComponentProps } from "react";
import { Emoji } from "react-apple-emojis";
const emojiNameToUnicode: Record<AppleEmojiProps["name"], string> = {
  //!replace
  "person-running": "🏃‍♂️",
  pizza: "🍕",
};
export type AppleEmojiProps = ComponentProps<typeof Emoji>;
export function AppleEmojiClientComponent({ name, ...props }: AppleEmojiProps) {
  const isAppleDevice = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent);
  if (isAppleDevice) {
    return emojiNameToUnicode[name];
  }
  return <Emoji name={name} {...props} />;
}
