import { FC } from "react";
import { CodeBlockWithClipboardButton } from "../../../syntax-highlighting/CodeBlockWithClipboardButton";
import { FernSyntaxHighlighter, FernSyntaxHighlighterProps } from "../../../syntax-highlighting/FernSyntaxHighlighter";

export const CodeBlock: FC<FernSyntaxHighlighterProps> = (props) => (
    <CodeBlockWithClipboardButton code={props.code}>
        <FernSyntaxHighlighter {...props} />
    </CodeBlockWithClipboardButton>
);
