import { FC } from "react";

import {
  CodeBlockWithClipboardButton,
  FernSyntaxHighlighter,
  type FernSyntaxHighlighterProps,
} from "@fern-docs/components/syntax-highlighter";

export const CodeBlock: FC<FernSyntaxHighlighterProps> = ({
  className,
  ...props
}) => (
  <CodeBlockWithClipboardButton code={props.code} className={className}>
    <FernSyntaxHighlighter {...props} />
  </CodeBlockWithClipboardButton>
);
