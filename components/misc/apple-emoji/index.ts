import dynamic from "next/dynamic";

const AppleEmoji = dynamic(
  () =>
    import("./component").then((result) => result.AppleEmojiClientComponent),
  { ssr: false }
);

export default AppleEmoji;
