import { RemoteFontAwesomeIcon } from "../../commons/FontAwesomeIcon";
import { FernMenu, FernMenuItem } from "../../components/FernMenu";
import type { CodeExample, CodeExampleGroup } from "../examples//code-example";

export declare namespace CodeExampleClientDropdown {
    export interface Props {
        clients: CodeExampleGroup[];
        selectedClient: CodeExample;
        onClickClient: (example: CodeExample) => void;
    }
}

export const CodeExampleClientDropdown: React.FC<CodeExampleClientDropdown.Props> = ({
    clients,
    selectedClient,
    onClickClient,
}) => {
    const selectedClientGroup = clients.find((client) => client.language === selectedClient.language);
    return (
        <div className="flex justify-end">
            <FernMenu
                text={selectedClientGroup?.languageDisplayName ?? selectedClient.language}
                icon={
                    <RemoteFontAwesomeIcon
                        className="bg-accent-primary dark:bg-accent-primary-dark size-4"
                        icon={selectedClientGroup?.icon}
                    />
                }
                align="right"
                menuClassName="overflow-hidden"
                size="small"
            >
                {clients.map((client) => (
                    <FernMenuItem
                        key={client.language}
                        selected={client.language === selectedClient.language}
                        onClick={() => {
                            if (client.examples[0] != null) {
                                onClickClient(
                                    client.examples.find(
                                        (example) => example.exampleIndex === selectedClient.exampleIndex,
                                    ) ?? client.examples[0],
                                );
                            }
                        }}
                    >
                        <RemoteFontAwesomeIcon
                            className="bg-accent-primary dark:bg-accent-primary-dark size-4"
                            icon={client.icon}
                        />
                        <div className="flex items-center whitespace-nowrap">
                            <span className="font-mono text-xs font-normal">{client.languageDisplayName}</span>
                        </div>
                    </FernMenuItem>
                ))}
            </FernMenu>
        </div>
    );
};

/*
{selectedClientGroup != null && selectedClientGroup.examples.length > 1 && (
    <div className="divide-border-primary dark:divide-border-primary-dark flex flex-col items-stretch divide-y overflow-hidden rounded-md bg-white shadow">
        {selectedClientGroup?.examples.map((example) => (
            <FernMenuItem
                key={example.key}
                selected={example.key === selectedClient.key}
                onClick={() => {
                    onClickClient(example);
                }}
                disableRoundCorners
            >
                <div className="flex items-center whitespace-nowrap">
                    <span className="font-mono text-xs font-normal">{example.name}</span>
                </div>
            </FernMenuItem>
        ))}
    </div>
)}
*/
