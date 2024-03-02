import { FC } from "react";
import { CodeBlockWithClipboardButton } from "../../commons/CodeBlockWithClipboardButton";
import {
    FernSyntaxHighlighterTokens,
    FernSyntaxHighlighterTokensProps,
} from "../../commons/FernSyntaxHighlighterTokens";

export const SyntaxHighlighter: FC<FernSyntaxHighlighterTokensProps> = (props) => (
    <CodeBlockWithClipboardButton code={props.tokens.code}>
        <FernSyntaxHighlighterTokens {...props} />
    </CodeBlockWithClipboardButton>
);
