import { FC } from "react";
import { CodeBlockWithClipboardButton } from "../../syntax-highlighting/CodeBlockWithClipboardButton.js";
import { FernSyntaxHighlighter, FernSyntaxHighlighterProps } from "../../syntax-highlighting/FernSyntaxHighlighter.js";

export const CodeBlock: FC<FernSyntaxHighlighterProps> = (props) => (
    <CodeBlockWithClipboardButton code={props.code}>
        <FernSyntaxHighlighter {...props} />
    </CodeBlockWithClipboardButton>
);
