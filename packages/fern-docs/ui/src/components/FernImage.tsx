import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import Image, { ImageProps } from "next/image";
import { ReactElement } from "react";

export declare namespace FernImage {
  export interface Props extends Omit<ImageProps, "src" | "alt"> {
    // FDR may return a URL or an image object depending on the version of the Fern CLI used to build the docs.
    // If the file has width/height metadata, we can render it using next/image for optimized loading.
    src: DocsV1Read.File_ | undefined;
    alt?: string;
    maxWidth?: number;
  }
}

export function FernImage({
  src,
  maxWidth,
  ...props
}: FernImage.Props): ReactElement | null {
  if (src == null) {
    return null;
  }

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

  return visitDiscriminatedUnion(src, "type")._visit({
    url: ({ url }) => {
      // eslint-disable-next-line @next/next/no-img-element
      return <img {...imgProps} src={url} alt={props.alt ?? ""} />;
    },
    image: ({
      url,
      width: realWidth,
      height: realHeight,
      blurDataUrl,
      alt,
    }) => {
      try {
        const pathname = new URL(url).pathname.toLowerCase();
        if (pathname.endsWith(".gif") || pathname.endsWith(".svg")) {
          // eslint-disable-next-line @next/next/no-img-element
          return <img {...imgProps} src={url} alt={props.alt ?? ""} />;
        }
      } catch (_e) {
        // Ignore errors
      }

      const { width, height } = getDimensions(
        maxWidth ?? props.width,
        realWidth,
        realHeight
      );

      return (
        <Image
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
        />
      );
    },
    _other: () => null,
  });
}

function getDimensions(
  layoutWidth: number | `${number}` | undefined,
  realWidth: number,
  realHeight: number
): { width: number; height: number } {
  layoutWidth =
    typeof layoutWidth === "string" ? parseInt(layoutWidth, 10) : layoutWidth;
  if (layoutWidth != null && isNaN(layoutWidth)) {
    layoutWidth = undefined;
  }
  if (layoutWidth != null && layoutWidth < realWidth) {
    return {
      width: layoutWidth,
      height: (layoutWidth / realWidth) * realHeight,
    };
  }
  return { width: realWidth, height: realHeight };
}
