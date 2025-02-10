import { FC } from "react";

import {
  CodeBlockWithClipboardButton,
  FernSyntaxHighlighter,
  type FernSyntaxHighlighterProps,
} from "@fern-docs/syntax-highlighter";

export const CodeBlock: FC<FernSyntaxHighlighterProps> = (props) => (
  <CodeBlockWithClipboardButton code={props.code}>
    <FernSyntaxHighlighter {...props} />
  </CodeBlockWithClipboardButton>
);
