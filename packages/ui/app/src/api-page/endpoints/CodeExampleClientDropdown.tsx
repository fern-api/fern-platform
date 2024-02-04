import classNames from "classnames";
import { RemoteFontAwesomeIcon } from "../../commons/FontAwesomeIcon";
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
                icon={
                    <RemoteFontAwesomeIcon
                        className="bg-accent-primary dark:bg-accent-primary-dark h-4 w-4"
                        icon={getIconForClient(selectedClient.id)}
                    />
                }
                align="right"
                size="small"
            >
                {clients.map(({ id: clientId, name: clientName }) => {
                    const selected = clientId === selectedClient.id;
                    return (
                        <FernMenuItem
                            key={clientId}
                            selected={clientId === selectedClient.id}
                            onClick={() => onClickClient(clientId)}
                        >
                            {(active) => (
                                <>
                                    <RemoteFontAwesomeIcon
                                        className={classNames("h-4 w-4", {
                                            "!bg-accent-primary dark:!bg-accent-primary-dark":
                                                selected || (active && !selected),
                                            "!bg-text-muted-light dark:!bg-text-muted-dark": !active && !selected,
                                        })}
                                        icon={getIconForClient(clientId)}
                                    />
                                    <div className="flex items-center whitespace-nowrap">
                                        <span className="font-mono text-xs font-normal">{clientName}</span>
                                    </div>
                                </>
                            )}
                        </FernMenuItem>
                    );
                })}
            </FernMenu>
        </div>
    );
};
