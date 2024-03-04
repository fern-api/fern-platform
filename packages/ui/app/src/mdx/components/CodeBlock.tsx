import { FC } from "react";
import { CodeBlockWithClipboardButton } from "../../syntax-highlighting/CodeBlockWithClipboardButton";
import {
    FernSyntaxHighlighterTokens,
    FernSyntaxHighlighterTokensProps,
} from "../../syntax-highlighting/FernSyntaxHighlighterTokens";

export const CodeBlock: FC<FernSyntaxHighlighterTokensProps> = (props) => (
    <CodeBlockWithClipboardButton code={props.tokens.code}>
        <FernSyntaxHighlighterTokens {...props} />
    </CodeBlockWithClipboardButton>
);
