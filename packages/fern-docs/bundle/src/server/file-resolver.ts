import { FileData } from "@/utils/types";
import type { FernNavigation } from "@fern-api/fdr-sdk";
import type { ImageData } from "@fern-docs/utils";

export function createFileResolver(
  files: Record<string, FileData>
): (src: string) => ImageData | undefined {
  return (src) => {
    if (src == null) {
      return undefined;
    }

    const fileId = src.startsWith("file:") ? src.slice(5) : src;
    const file = files[fileId as FernNavigation.FileId];
    if (file == null) {
      // the file is not found, so we return the src as the image data
      return { src };
    }

    return {
      src: file.url,
      width: file.width,
      height: file.height,
      blurDataUrl: file.blurDataUrl,
      alt: file.alt,
    };
  };
}
