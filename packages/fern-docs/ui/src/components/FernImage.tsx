/* eslint-disable @next/next/no-img-element */

import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import Image from "next/image";
import { ComponentPropsWithoutRef, forwardRef } from "react";

export const FernImage = forwardRef<
  HTMLImageElement,
  Omit<ComponentPropsWithoutRef<typeof Image>, "src" | "alt"> & {
    /**
     * FDR may return a URL or an image object depending on the version of the Fern CLI used to build the docs.
     * If the file has width/height metadata, we can render it using next/image for optimized loading.
     */
    src: DocsV1Read.File_ | undefined;
    /**
     * The alt text for the image.
     * @default ""
     */
    alt?: string;
  }
>(({ src, ...props }, ref) => {
  if (src == null) {
    return null;
  }

  const { width, height } =
    src.type === "image"
      ? getDimensions({
          intrinsicWidth: src.width,
          intrinsicHeight: src.height,
          width: props.width,
          height: props.height,
        })
      : props;

  const blurDataURL =
    props.blurDataURL ?? (src.type === "image" ? src.blurDataUrl : undefined);

  const pathname = safeGetPathname(src.url);

  if (src.type === "url") {
    return (
      <img
        ref={ref}
        {...props}
        src={src.url}
        alt={props.alt}
        fetchPriority={props.priority ? "high" : undefined}
        loading={props.priority ? "eager" : undefined}
        style={{
          width,
          height,
          ...props.style,
        }}
      />
    );
  }

  return (
    <Image
      ref={ref}
      {...props}
      src={src.url}
      overrideSrc={src.url}
      width={width}
      height={height}
      alt={props.alt ?? (src.type === "image" ? src.alt : undefined) ?? ""}
      placeholder={
        props.placeholder ?? (blurDataURL != null ? "blur" : "empty")
      }
      blurDataURL={blurDataURL}
      unoptimized={
        pathname?.endsWith(".gif") ||
        pathname?.endsWith(".svg") ||
        props.unoptimized
      }
      style={{
        width,
        height,
        ...props.style,
      }}
    />
  );
});

FernImage.displayName = "FernImage";

function safeGetPathname(url: string): string | undefined {
  try {
    return new URL(url, "https://n").pathname.toLowerCase();
  } catch (_e) {
    return undefined;
  }
}

export function getDimensions({
  intrinsicWidth,
  intrinsicHeight,
  width,
  height,
}: {
  intrinsicWidth: number;
  intrinsicHeight: number;
  width?: number | `${number}`;
  height?: number | `${number}`;
}): { width: number; height: number } {
  const propWidth = asNumber(width);
  const propHeight = asNumber(height);

  // If the user has explicitly set the width and height, use those values.
  if (propWidth != null && propHeight != null) {
    return { width: propWidth, height: propHeight };
  }

  const aspectRatio = intrinsicWidth / intrinsicHeight;

  // if the user has the width and height, use that to determine the aspect ratio
  if (propWidth != null) {
    return { width: propWidth, height: propWidth / aspectRatio };
  } else if (propHeight != null) {
    return { width: propHeight * aspectRatio, height: propHeight };
  }

  return { width: intrinsicWidth, height: intrinsicHeight };
}

function asNumber(value: number | `${number}` | undefined): number | undefined {
  if (value == null) {
    return undefined;
  }
  if (typeof value === "string") {
    return parseInt(value, 10);
  }
  return value;
}
