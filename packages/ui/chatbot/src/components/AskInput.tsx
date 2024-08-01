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
            <div className="flex w-full flex-col gap-1.5 rounded-[26px] p-1.5 transition-colors bg-grayscale-a3">
                <div className="flex items-end gap-1.5 md:gap-2">
                    <div className="flex min-w-0 flex-1 flex-col pl-4">
                        <TextArea
                            style={{ height: 40 }}
                            placeholder="Ask me a question about Cohere"
                            className="px-0 py-2 m-0 resize-none text-grayscale-12 placeholder:text-grayscale-a10 border-0 bg-transparent focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 max-h-52"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDownCapture={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    onSend(value);
                                    setValue("");
                                }
                            }}
                        />
                    </div>
                    <SendButton disabled={value.trim().length === 0} />
                </div>
            </div>
        </div>
    );
}
