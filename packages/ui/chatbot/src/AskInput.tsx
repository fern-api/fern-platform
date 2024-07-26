import { ReactElement, useState } from "react";
import { SendButton } from "./SendButton";
import { TextArea } from "./TextArea";

export function AskInput(): ReactElement {
    const [value, setValue] = useState("");
    return (
        <div className="flex w-full items-center">
            <div className="flex w-full flex-col gap-1.5 rounded-[26px] p-1.5 transition-colors bg-[#f4f4f4] dark:bg-gray-700">
                <div className="flex items-end gap-1.5 md:gap-2">
                    <div className="flex min-w-0 flex-1 flex-col pl-4">
                        <TextArea
                            style={{ height: 40 }}
                            placeholder="Ask me a question about Cohere"
                            className="m-0 resize-none text-white border-0 bg-transparent px-0 text-token-text-primary focus:ring-0 focus-visible:ring-0 max-h-[25dvh]"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                        />
                    </div>
                    <SendButton disabled={value.trim().length === 0} />
                </div>
            </div>
        </div>
    );
}
