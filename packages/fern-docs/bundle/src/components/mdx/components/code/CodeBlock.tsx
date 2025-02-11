import { FC } from "react";

import { cn } from "@fern-docs/components";
import {
  CodeBlockWithClipboardButton,
  FernSyntaxHighlighter,
  type FernSyntaxHighlighterProps,
} from "@fern-docs/syntax-highlighter";

import { useIsDarkCode } from "@/state/dark-code";

export const CodeBlock: FC<FernSyntaxHighlighterProps> = (props) => {
  const isDarkCodeEnabled = useIsDarkCode();
  return (
    <CodeBlockWithClipboardButton
      code={props.code}
      className={cn({ "bg-card-solid dark": isDarkCodeEnabled })}
    >
      <FernSyntaxHighlighter {...props} />
    </CodeBlockWithClipboardButton>
  );
};
