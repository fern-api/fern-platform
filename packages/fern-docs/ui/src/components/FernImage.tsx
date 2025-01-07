/* eslint-disable @next/next/no-img-element */

import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
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
    /**
     * The maximum width of the image.
     * We will use this to scale down the image if it is larger than the max width, using a "contains" strategy.
     */
    maxWidth?: number;
    /**
     * The maximum height of the image.
     * We will use this to scale down the image if it is larger than the max height, using a "contains" strategy.
     */
    maxHeight?: number;
  }
>(({ src, maxWidth, maxHeight, ...props }, ref) => {
  if (src == null) {
    return null;
  }

  const style = {
    // if the user has provided a width or height, we don't want to apply the maxWidth/maxHeight
    maxWidth: props.width || props.height ? undefined : maxWidth,
    maxHeight: props.height || props.width ? undefined : maxHeight,
    ...props.style,
  };

  function renderImg(url: string) {
    const {
      fill,
      loader,
      quality,
      priority,
      placeholder,
      blurDataURL,
      unoptimized,
      ...imgProps
    } = props;

    return (
      <img
        ref={ref}
        {...imgProps}
        src={url}
        alt={props.alt ?? ""}
        style={style}
      />
    );
  }

  return visitDiscriminatedUnion(src, "type")._visit({
    url: ({ url }) => renderImg(url),
    image: ({
      url,
      width: originalWidth,
      height: originalHeight,
      blurDataUrl,
      alt,
    }) => {
      try {
        const pathname = new URL(url).pathname.toLowerCase();
        if (pathname.endsWith(".gif") || pathname.endsWith(".svg")) {
          return renderImg(url);
        }
      } catch (_e) {
        // Ignore errors
      }

      const { width, height } = getDimensions({
        originalWidth,
        originalHeight,
        maxWidth,
        maxHeight,
        propWidth: props.width,
        propHeight: props.height,
      });

      return (
        <Image
          ref={ref}
          {...props}
          src={url}
          width={width}
          height={height}
          alt={props.alt ?? alt ?? ""}
          placeholder={
            props.placeholder ?? (blurDataUrl != null ? "blur" : "empty")
          }
          blurDataURL={props.blurDataURL ?? blurDataUrl}
          overrideSrc={url}
          style={style}
        />
      );
    },
    _other: () => null,
  });
});

FernImage.displayName = "FernImage";

/**
 * Given the original dimensions of the image, compute the maximum dimensions
 * that we can render the image at.
 *
 * There are 3 sources of width/height:
 * 1. The user has explicitly set the width and height.
 * 2. The layout has a maxWidth and maxHeight.
 * 3. The image has width/height metadata.
 *
 * We will use the smallest of the 3 sources to determine the final width/height,
 * and we'll infer the aspect ratio from the original dimensions.
 *
 * @visibleForTesting
 */
export function getDimensions({
  originalWidth,
  originalHeight,
  maxWidth,
  maxHeight,
  propWidth,
  propHeight,
}: {
  originalWidth: number;
  originalHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  propWidth?: number | `${number}`;
  propHeight?: number | `${number}`;
}): { width: number; height: number } {
  propWidth = asNumber(propWidth);
  propHeight = asNumber(propHeight);

  // If the user has explicitly set the width and height, use those values.
  if (propWidth != null && propHeight != null) {
    return { width: propWidth, height: propHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  // if the user has the width and height, use that to determine the aspect ratio
  if (propWidth != null) {
    return { width: propWidth, height: propWidth / aspectRatio };
  } else if (propHeight != null) {
    return { width: propHeight * aspectRatio, height: propHeight };
  }

  // use the "contains" strategy to shrink the image to fit within the maxWidth/maxHeight
  if (maxWidth != null || maxHeight != null) {
    const widthRatio = maxWidth != null ? maxWidth / originalWidth : Infinity;
    const heightRatio =
      maxHeight != null ? maxHeight / originalHeight : Infinity;
    const ratio = Math.min(widthRatio, heightRatio);
    return { width: originalWidth * ratio, height: originalHeight * ratio };
  }

  return { width: originalWidth, height: originalHeight };
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
