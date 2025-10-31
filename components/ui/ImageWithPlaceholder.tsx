import { ImgHTMLAttributes, useState } from "react";
import { Skeleton } from "./skeleton";

export function ImageWithPlaceholder({
  width,
  height,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <Skeleton isLoading={!isLoaded}>
        <img
          onLoad={() => setIsLoaded(true)}
          {...props}
          width={width}
          height={height}
        />
      </Skeleton>
    </>
  );
}
