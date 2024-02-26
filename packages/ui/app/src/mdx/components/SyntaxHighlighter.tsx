import { FC } from "react";
import { CodeBlockWithClipboardButton } from "../../commons/CodeBlockWithClipboardButton";
import {
    FernSyntaxHighlighterContent,
    FernSyntaxHighlighterContentProps,
} from "../../commons/FernSyntaxHighlighterContent";

export declare namespace SyntaxHighlighter {
    export interface Props extends FernSyntaxHighlighterContentProps {
        code: string;
    }
}

export const SyntaxHighlighter: FC<SyntaxHighlighter.Props> = ({ code, ...props }) => (
    <CodeBlockWithClipboardButton code={code}>
        <FernSyntaxHighlighterContent {...props} />
    </CodeBlockWithClipboardButton>
);
