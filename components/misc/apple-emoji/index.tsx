"use client";
import emojiSrcsSource from "@/data/apple-emojis.json";
import { cn } from "@/helpers/cn";
import { ImgHTMLAttributes } from "react";

const emojiSrcs = emojiSrcsSource as Record<string, string>;
export function AppleEmoji({
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
    { [textClassName || "leading-none"]: isText },
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
      src={`https://em-content.zobj.net/source/apple/${emojiSrcs[value]}`}
      alt={value}
      aria-label={value}
      {...props}
      className={className}
    />
  );
}
