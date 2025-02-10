import { useMemo, useState } from "react";

import { useTimeout } from "./useTimeout";

export declare namespace useCopyToClipboard {
  export interface Return {
    copyToClipboard: (() => void) | undefined;
    wasJustCopied: boolean;
  }
}

export function useCopyToClipboard(
  content: string | (() => string | Promise<string>) | undefined
): useCopyToClipboard.Return {
  const [wasJustCopied, setWasJustCopied] = useState(false);

  const copyToClipboard = useMemo(() => {
    if (content == null) {
      return undefined;
    }
    return async () => {
      setWasJustCopied(true);
      await navigator.clipboard.writeText(
        typeof content === "function" ? await content() : content
      );
    };
  }, [content]);

  useTimeout(
    () => {
      setWasJustCopied(false);
    },
    wasJustCopied ? 2_000 : undefined
  );

  return {
    copyToClipboard,
    wasJustCopied,
  };
}
