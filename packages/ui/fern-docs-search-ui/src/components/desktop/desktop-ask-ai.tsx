import { PropsWithChildren, ReactNode, isValidElement } from "react";
import { useSearchBox } from "react-instantsearch";
import { noop } from "ts-essentials";
import { UseAskAIOpts, useAskAI } from "../chatbot/use-ask-ai";
import { CodeBlock } from "../code-block";
import { CommandAskAIGroup } from "../shared/command-ask-ai";
import { useCommandUx } from "../shared/command-ux";
import { AskAICommandItems } from "./desktop-ask-ai-conversation";

export function DesktopAskAI({
    children,
    open,
    onOpenChange,
    ...opts
}: PropsWithChildren<
    {
        open: boolean;
        onOpenChange: (open: boolean) => void;
    } & UseAskAIOpts
>): ReactNode {
    const { query, clear } = useSearchBox();
    const { scrollTop, focus, setInputError } = useCommandUx();
    const chat = useAskAI({
        initialInput: query,
        ...opts,
    });

    const askAI = (message: string) => {
        onOpenChange(true);

        if (message.trim().split(/\s+/).length < 2) {
            if (message.length > 0) {
                setInputError("Enter at least 2 words");
            }
            focus();
            return;
        } else {
            setInputError(null);
        }

        void chat.append({
            role: "user",
            content: message,
        });
        clear();
        focus();
        scrollTop();
    };

    return (
        <>
            {!open && (
                <CommandAskAIGroup
                    query={query.trim().split(/\s+/).length < 2 ? "" : query.trim()}
                    onAskAI={() => onOpenChange(true)}
                    forceMount
                />
            )}
            {!open && children}
            {open && (
                <AskAICommandItems
                    messages={chat.messages}
                    headers={opts.headers}
                    askAI={askAI}
                    onSelectHit={noop}
                    components={{
                        pre(props) {
                            if (isValidElement(props.children) && props.children.type === "code") {
                                const { children, className } = props.children.props as {
                                    children: string;
                                    className: string;
                                };
                                if (typeof children === "string") {
                                    const match = /language-(\w+)/.exec(className || "")?.[1] ?? "plaintext";
                                    return <CodeBlock code={children} language={match} />;
                                }
                            }
                            return <pre {...props} />;
                        },
                    }}
                    isLoading={chat.isLoading}
                    refreshLastMessage={() => {
                        void chat.reload();
                        focus();
                        scrollTop();
                    }}
                />
            )}
        </>
    );
}
