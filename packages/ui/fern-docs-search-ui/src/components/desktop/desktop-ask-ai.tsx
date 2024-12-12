import { composeEventHandlers } from "@radix-ui/primitive";
import { Command } from "cmdk";
import { noop } from "es-toolkit/function";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { ComponentPropsWithoutRef, forwardRef, isValidElement, useCallback, useEffect, useRef } from "react";
import { UseAskAIOpts, useAskAI } from "../chatbot/use-ask-ai";
import { CodeBlock } from "../code-block";
import { Button } from "../ui/button";
import { TextArea } from "../ui/textarea";
import { AskAICommandItems } from "./desktop-ask-ai-conversation";
import { afterInput } from "./desktop-command";

export const DesktopAskAICommand = forwardRef<
    HTMLDivElement,
    ComponentPropsWithoutRef<typeof Command> &
        UseAskAIOpts & {
            onClose?: () => void;
            returnToSearch?: () => void;
        }
>(({ children, api, initialInput, algoliaSearchKey, model, systemContext, onClose, returnToSearch, ...props }, ref) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const focus = useCallback(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        });
    }, [inputRef]);

    useEffect(() => {
        setTimeout(() => {
            focus();
        }, 10);
    }, [focus]);

    // const { query, clear } = useSearchBox();
    // const { focus, setInputError, input } = useCommandUx();
    const chat = useAskAI({
        initialInput,
        api,
        algoliaSearchKey,
        model,
        systemContext,
    });
    const askAI = useCallback(
        (message: string) => {
            if (message.trim().split(/\s+/).length < 2) {
                // if (message.length > 0) {
                //     setInputError("Enter at least 2 words");
                // }
                focus();
                return;
            } else {
                // setInputError(null);
            }
            void chat.append({ role: "user", content: message });
            chat.setInput("");
            focus();
        },
        [chat, focus],
    );

    return (
        <Command
            label="Ask AI"
            {...props}
            ref={ref}
            id="fern-search-desktop-command"
            shouldFilter={false}
            onKeyDown={composeEventHandlers(props.onKeyDown, (e) => {
                if (e.key === "Escape") {
                    if (chat.input.length > 0) {
                        chat.setInput("");
                    } else {
                        onClose?.();
                    }
                    e.preventDefault();
                    e.stopPropagation();
                }
            })}
        >
            <div className="flex items-center justify-between p-2">
                <div>
                    {returnToSearch && (
                        <Button size="xs" variant="outline" onClick={returnToSearch}>
                            <ArrowLeft />
                            Back to search
                        </Button>
                    )}
                </div>
                <div>
                    <afterInput.Out />
                </div>
            </div>
            <Command.List>
                <AskAICommandItems
                    algoliaSearchKey={algoliaSearchKey}
                    messages={chat.messages}
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
                                    return <CodeBlock code={children} language={match} fontSize="sm" />;
                                }
                            }
                            return <pre {...props} />;
                        },
                    }}
                    isLoading={chat.isLoading}
                    refreshLastMessage={() => {
                        void chat.reload();
                        focus();
                    }}
                />
            </Command.List>

            {children}

            <div
                className="p-2 border-t border-[var(--grayscale-a6)] cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                <TextArea
                    ref={inputRef}
                    className="w-full resize-none focus:outline-none block"
                    autoFocus
                    placeholder="Ask AI"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            if (e.shiftKey) {
                                e.preventDefault();
                                e.stopPropagation();
                            } else {
                                askAI(inputRef.current?.value ?? "");
                            }
                        }
                    }}
                    value={chat.input}
                    onValueChange={chat.setInput}
                />
                <div className="ml-auto w-fit">
                    <Button size="icon" className="rounded-full" variant="ghost">
                        <ArrowUp />
                    </Button>
                </div>
            </div>
        </Command>
    );
});

DesktopAskAICommand.displayName = "DesktopAskAICommand";
