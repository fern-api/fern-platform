/* eslint-disable no-console */
import { FernButton, FernDropdown, RemoteFontAwesomeIcon } from "@fern-ui/components";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import type { CodeExample, CodeExampleGroup } from "../examples/code-example";

export declare namespace CodeExampleClientDropdown {
    export interface Props {
        clients: CodeExampleGroup[];
        selectedCodeExample: CodeExample;
        onClickClient: (example: CodeExample) => void;
    }
}

export const CodeExampleClientDropdown: React.FC<CodeExampleClientDropdown.Props> = ({
    clients,
    selectedCodeExample,
    onClickClient,
}) => {
    function onValueChangeHandler(value: string) {
        const selectedLanguageClient = clients.find((client) => client.language === value);
        if (selectedLanguageClient?.examples[0] != null) {
            console.log(selectedLanguageClient);
            const codeExample: CodeExample =
                selectedLanguageClient.examples.find((example) => example.name === selectedCodeExample.name) ??
                selectedLanguageClient.examples[0];
            onClickClient(codeExample);
        }
    }

    const selectedClientGroup = clients.find((client) => client.language === selectedCodeExample.language);
    return (
        <div className="flex justify-end">
            <FernDropdown
                value={selectedCodeExample.language}
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
                onValueChange={(value) => onValueChangeHandler(value)}
            >
                <FernButton
                    icon={<RemoteFontAwesomeIcon className="bg-accent size-4" icon={selectedClientGroup?.icon} />}
                    rightIcon={<ChevronDownIcon />}
                    text={selectedClientGroup?.languageDisplayName ?? selectedCodeExample.language}
                    size="small"
                    variant="outlined"
                    mono={true}
                />
            </FernDropdown>
        </div>
    );
};
