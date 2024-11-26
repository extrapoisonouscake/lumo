"use client";
import emojiSrcsSource from "@/data/apple-emojis.json";
import { cn } from "@/lib/utils";
import { ImgHTMLAttributes } from "react";

const emojiSrcs = emojiSrcsSource as Record<string, string>;
export function AppleEmojiComponent({
  value,
  className: commonClassName,
  textClassName,
  imageClassName,
  ...props
}: {
  value: string;
  textClassName?: string;
  imageClassName?: string;
} & ImgHTMLAttributes<HTMLImageElement>) {
  const isAppleDevice = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent);
  const isText = isAppleDevice || !(value in emojiSrcs);
  const className = cn(
    commonClassName,
    { [textClassName || ""]: isText },
    { [cn("size-5", imageClassName)]: !isText }
  );

  if (isText) {
    return (
      <p {...props} className={className}>
        {value}
      </p>
    );
  }
  return (
    <img
      src={emojiSrcs[value]}
      alt={value}
      aria-label={value}
      {...props}
      className={className}
    />
  );
}
