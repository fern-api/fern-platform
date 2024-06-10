import { ReactElement } from "react";
import { CodeExample, CodeExampleGroup } from "../examples/code-example";

interface LanguageTabsProps {
    clients: CodeExampleGroup[];
    onClickClient: (client: CodeExample) => void;
    selectedClient: CodeExample;
}

export function LanguageTabs({ clients, onClickClient, selectedClient }: LanguageTabsProps): ReactElement {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguage = event.target.value;
        const client = clients.find((client) => client.language === selectedLanguage);
        if (client) {
            onClickClient(client.examples[0]);
        }
    };
    return (
        <select
            value={selectedClient.language}
            onChange={handleChange}
            className="border-none rounded-md py-1 pl-2 pr-8 hover:bg-[#F1F3F4] -mx-1"
        >
            {clients.map((client) => (
                <option key={client.language} value={client.language}>
                    {client.languageDisplayName}
                </option>
            ))}
        </select>
    );
}

// export function LanguageTabs({ clients, onClickClient, selectedClient }: LanguageTabsProps): ReactElement {
//     return (
//         <div className="h-full overflow-x-scroll overflow-y-hidden mask-grad-right-6 flex-1">
//             <ul className="fern-tabs h-full -mx-3 px-0">
//                 {clients.map((client) => (
//                     <li key={client.language} className="fern-tab accented">
//                         <button
//                             className="group/tab-button px-[18px]"
//                             onClick={() => {
//                                 onClickClient(client.examples[0]);
//                             }}
//                             data-state={client.language === selectedClient.language ? "active" : "inactive"}
//                         >
//                             <div className="flex min-w-0 items-center justify-start space-x-2">
//                                 <span className="truncate font-medium font-headings">{client.languageDisplayName}</span>
//                             </div>
//                         </button>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }
