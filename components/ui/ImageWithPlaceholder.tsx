import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { Skeleton } from "./skeleton";

export function ImageWithPlaceholder({ width, height, ...props }: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <Skeleton isLoading={!isLoaded}>
        <Image
          onLoad={() => setIsLoaded(true)}
          {...props}
          width={width}
          height={height}
        />
      </Skeleton>
    </>
  );
}
