import { ReactElement } from "react";
import { AskInput } from "./AskInput";

export function ChatbotModal(): ReactElement {
    return (
        <section className="bg-white text-black rounded-lg w-full">
            <div className="px-4 py-2">
                <span className="text-sm text-gray-500">Ask AI</span>
            </div>
            <div className="min-h-10 overflow-y-auto overflow-x-hidden p-4">Testing</div>
            <div className="p-4">
                <AskInput />
            </div>
        </section>
    );
}
