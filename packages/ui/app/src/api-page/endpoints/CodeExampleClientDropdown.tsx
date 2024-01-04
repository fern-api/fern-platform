import { FontAwesomeIcon } from "../../commons/FontAwesomeIcon";
import { FernMenu, FernMenuItem } from "../../components/FernMenu";
import type { CodeExampleClient, CodeExampleClientId } from "../examples//code-example";

function getIconForClient(clientId: CodeExampleClientId) {
    switch (clientId) {
        case "curl":
            return "fa-solid fa-code";
        case "python":
        case "python-async":
            return "fa-brands fa-python";
        case "typescript":
            return "fa-brands fa-js";
    }
}

export declare namespace CodeExampleClientDropdown {
    export interface Props {
        clients: CodeExampleClient[];
        selectedClient: CodeExampleClient;
        onClickClient: (clientId: CodeExampleClientId) => void;
    }
}

export const CodeExampleClientDropdown: React.FC<CodeExampleClientDropdown.Props> = ({
    clients,
    selectedClient,
    onClickClient,
}) => {
    return (
        <div className="flex justify-end">
            <FernMenu
                text={selectedClient.name}
                icon={<FontAwesomeIcon className="h-4 w-4" icon={getIconForClient(selectedClient.id)} />}
            >
                {clients.map(({ id: clientId, name: clientName }) => (
                    <FernMenuItem
                        key={clientId}
                        selected={clientId === selectedClient.id}
                        onClick={() => onClickClient(clientId)}
                    >
                        <FontAwesomeIcon className="h-4 w-4" icon={getIconForClient(clientId)} />
                        <div className="flex items-center whitespace-nowrap">
                            <span className="font-mono text-xs font-normal">{clientName}</span>
                        </div>
                    </FernMenuItem>
                ))}
            </FernMenu>
        </div>
    );
};
