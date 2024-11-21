"use client";

import { useChat } from "ai/react";
import { ReactElement, isValidElement } from "react";
import { CodeBlock } from "./code-block";
import { MarkdownContent } from "./md-content";

export default function Chat({ initialInput, domain }: { initialInput?: string; domain: string }): ReactElement {
    const { messages, data, input, handleInputChange, handleSubmit } = useChat({
        initialInput,
        api: `/api/chat?domain=${domain}`,
    });

    const messagesWithContent = messages.filter((m) => m.content);

    return (
        <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
            {messagesWithContent.map((m) => (
                <div key={m.id} className="whitespace-pre-wrap">
                    {m.role === "user" ? "User: " : "AI: "}
                    <MarkdownContent
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
                    >
                        {m.content}
                    </MarkdownContent>
                </div>
            ))}

            {data &&
                data.map((ref, idx) => (
                    <div key={idx} className="whitespace-pre-wrap">
                        {JSON.stringify(ref)}
                    </div>
                ))}

            <form onSubmit={handleSubmit}>
                <input
                    className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
                    value={input}
                    placeholder="Say something..."
                    onChange={handleInputChange}
                />
            </form>
        </div>
    );
}
