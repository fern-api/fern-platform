import {
    CodeBlockWithClipboardButton,
    FernSyntaxHighlighter,
    type FernSyntaxHighlighterProps,
} from "@fern-ui/fern-docs-syntax-highlighter";
import { FC } from "react";

export const CodeBlock: FC<FernSyntaxHighlighterProps> = (props) => (
    <CodeBlockWithClipboardButton code={props.code}>
        <FernSyntaxHighlighter {...props} />
    </CodeBlockWithClipboardButton>
);
