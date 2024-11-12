"use client";

import { useChat } from "ai/react";
import { ReactElement } from "react";

export default function Chat({ initialInput, domain }: { initialInput?: string; domain: string }): ReactElement {
    const { messages, data, input, handleInputChange, handleSubmit } = useChat({
        initialInput,
        api: `/api/chat?domain=${domain}`,
    });

    return (
        <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
            {messages
                .filter((m) => m.content)
                .map((m) => (
                    <div key={m.id} className="whitespace-pre-wrap">
                        {m.role === "user" ? "User: " : "AI: "}
                        {m.content}
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
