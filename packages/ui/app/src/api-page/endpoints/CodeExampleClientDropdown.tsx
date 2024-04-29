import { ChevronDownIcon } from "@radix-ui/react-icons";
import { RemoteFontAwesomeIcon } from "../../commons/FontAwesomeIcon";
import { FernButton } from "../../components/FernButton";
import { FernDropdown } from "../../components/FernDropdown";
import type { CodeExample, CodeExampleGroup } from "../examples/code-example";

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
            <FernDropdown
                value={selectedClient.language}
                options={clients.map((client) => ({
                    type: "value",
                    label: client.languageDisplayName,
                    value: client.language,
                    className: "group/option",
                    icon: (
                        <RemoteFontAwesomeIcon
                            className="size-3 bg-intent-default group-data-[highlighted]/option:bg-accent-contrast"
                            icon={client.icon}
                        />
                    ),
                }))}
                onValueChange={(value) => {
                    const client = clients.find((client) => client.language === value);
                    if (client?.examples[0] != null) {
                        onClickClient(
                            client.examples.find((example) => example.exampleIndex === selectedClient.exampleIndex) ??
                                client.examples[0],
                        );
                    }
                }}
            >
                <FernButton
                    icon={<RemoteFontAwesomeIcon className="bg-accent size-4" icon={selectedClientGroup?.icon} />}
                    rightIcon={<ChevronDownIcon />}
                    text={selectedClientGroup?.languageDisplayName ?? selectedClient.language}
                    size="small"
                    variant="outlined"
                    mono={true}
                />
            </FernDropdown>
        </div>
    );
};
