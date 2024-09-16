import clsx from "clsx";
import { ReactElement, useState } from "react";
import { SendButton } from "./SendButton";
import { TextArea } from "./TextArea";

interface AskInputProps {
    className?: string;
    onSend: (message: string) => void;
}

export function AskInput({ onSend, className }: AskInputProps): ReactElement {
    const [value, setValue] = useState("");

    return (
        <div className={clsx("flex w-full items-center", className)}>
            <div className="bg-grayscale-a3 flex w-full flex-col gap-1.5 rounded-[26px] p-1.5 transition-colors">
                <div className="flex items-end gap-1.5 md:gap-2">
                    <div className="flex min-w-0 flex-1 flex-col pl-4">
                        <TextArea
                            style={{ height: 40 }}
                            placeholder="Ask me a question about Cohere"
                            className="text-grayscale-12 placeholder:text-grayscale-a10 m-0 max-h-52 resize-none border-0 bg-transparent px-0 py-2 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDownCapture={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    onSend(value);
                                    setValue("");
                                }
                            }}
                            autoFocus
                        />
                    </div>
                    <SendButton disabled={value.trim().length === 0} onClick={() => onSend(value)} />
                </div>
            </div>
        </div>
    );
}
