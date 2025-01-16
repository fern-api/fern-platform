import { ComponentProps } from "react";

import { FC } from "react";

import { DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { FILES_ATOM } from "../../../atoms/files";

export const Embed: FC<ComponentProps<"embed">> = ({ src, ...rest }) => {
  const files = useAtomValue(FILES_ATOM);

  const fernEmbedSrc = useMemo((): DocsV1Read.File_ | undefined => {
    if (src == null) {
      return undefined;
    }

    // if src starts with `file:`, assume it's a referenced file; fallback to src if not found
    if (src.startsWith("file:")) {
      const fileId = FdrAPI.FileId(src.slice(5));
      return files[fileId] ?? { type: "url", url: FdrAPI.Url(src) };
    }

    return { type: "url", url: FdrAPI.Url(src) };
  }, [files, src]);

  return (
    <embed
      src={fernEmbedSrc?.url ? fernEmbedSrc.url.toString() : undefined}
      {...rest}
    />
  );
};
