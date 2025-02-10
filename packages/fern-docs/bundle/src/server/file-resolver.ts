import "server-only";

import { FernNavigation } from "@fern-api/fdr-sdk";

import { FileData } from "./types";

export function createFileResolver(files: Record<string, FileData>) {
  return (src: string | undefined) => {
    if (src == null) {
      return undefined;
    }

    const fileId = FernNavigation.FileId(
      src.startsWith("file:") ? src.slice(5) : src
    );
    const file = files[fileId];
    if (file == null) {
      // the file is not found, so we return the src as the image data
      return { src };
    }
    return file;
  };
}
