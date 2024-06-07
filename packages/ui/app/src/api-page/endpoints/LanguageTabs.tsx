import { ReactElement, useRef } from "react";
import { CodeExample, CodeExampleGroup } from "../examples/code-example";

interface LanguageTabsProps {
    clients: CodeExampleGroup[];
    onClickClient: (client: CodeExample) => void;
    selectedClient: CodeExample;
}

export function LanguageTabs({ clients, onClickClient, selectedClient }: LanguageTabsProps): ReactElement {
    const ref = useRef<HTMLDivElement>(null);
    return (
        <div ref={ref} className="h-full overflow-x-scroll overflow-y-hidden mask-grad-right-6 flex-1">
            <ul className="fern-tabs h-full -mx-3 px-0">
                {clients.map((client) => (
                    <li key={client.language} className="fern-tab accented">
                        <button
                            className="group/tab-button px-[18px]"
                            onClick={() => {
                                onClickClient(client.examples[0]);
                            }}
                            data-state={client.language === selectedClient.language ? "active" : "inactive"}
                        >
                            <div className="flex min-w-0 items-center justify-start space-x-2">
                                <span className="truncate font-medium font-headings">{client.languageDisplayName}</span>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
