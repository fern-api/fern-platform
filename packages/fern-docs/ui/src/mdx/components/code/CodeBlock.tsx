import {
  CodeBlockWithClipboardButton,
  FernSyntaxHighlighter,
  type FernSyntaxHighlighterProps,
} from "@fern-docs/syntax-highlighter";
import { FC } from "react";
import { applyTemplates, useTemplate } from "./Template";

export const CodeBlock: FC<FernSyntaxHighlighterProps> = (props) => {
  const data = useTemplate();
  return (
    <CodeBlockWithClipboardButton code={() => applyTemplates(props.code, data)}>
      <FernSyntaxHighlighter
        {...props}
        code={applyTemplates(props.code, data)}
      />
    </CodeBlockWithClipboardButton>
  );
};
