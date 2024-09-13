import {
    CodeBlockWithClipboardButton,
    FernSyntaxHighlighter,
    FernSyntaxHighlighterProps,
} from "@fern-ui/syntax-highlighter";
import { FC } from "react";

export const CodeBlock: FC<FernSyntaxHighlighterProps> = (props) => (
    <CodeBlockWithClipboardButton code={props.code}>
        <FernSyntaxHighlighter {...props} />
    </CodeBlockWithClipboardButton>
);
