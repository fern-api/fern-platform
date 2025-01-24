import { ComponentProps } from "react";

import { FC } from "react";

import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { FILES_ATOM } from "../../../atoms/files";
import { getFernEmbedSrc } from "../../common/util";

export const Embed: FC<ComponentProps<"embed">> = ({ src, ...rest }) => {
  const files = useAtomValue(FILES_ATOM);

  const fernEmbedSrc = useMemo(() => getFernEmbedSrc(src, files), [files, src]);

  return (
    <embed
      src={fernEmbedSrc?.url ? fernEmbedSrc.url.toString() : undefined}
      {...rest}
    />
  );
};
