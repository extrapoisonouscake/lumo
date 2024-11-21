import emojiSrcsSource from "@/data/apple-emojis.json";
import { ImgHTMLAttributes } from "react";
const emojiNameToUnicode: Record<string, string> = {
  //!replace
  "person-running": "🏃‍♂️",
  pizza: "🍕",
};
const emojiSrcs = emojiSrcsSource as Record<string, string>;
export function AppleEmojiComponent({
  name,
  ...props
}: { name: string } & ImgHTMLAttributes<HTMLImageElement>) {
  const isAppleDevice = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent);
  if (isAppleDevice) {
    return emojiNameToUnicode[name];
  }
  if (!(name in emojiSrcs)) return name;
  return <img src={emojiSrcs[name]} alt={name} aria-label={name} {...props} />;
}
