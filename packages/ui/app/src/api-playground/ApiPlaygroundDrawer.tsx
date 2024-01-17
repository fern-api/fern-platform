import { Button, Tooltip } from "@blueprintjs/core";
import { Cross } from "@blueprintjs/icons";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { Dispatch, FC, ReactElement, SetStateAction } from "react";
import { ApiPlayroundContent } from "./ApiPlaygroundContent";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";
import { ApiPlaygroundEndpointSelector } from "./ApiPlaygroundEndpointSelector";
import { PlaygroundEndpointRender } from "./PlaygroundEndpointRender";
import { SecretBearer } from "./PlaygroundSecretsModal";
import { PlaygroundRequestFormState } from "./types";

interface ApiPlaygroundDrawerProps {
    endpoint: APIV1Read.EndpointDefinition | undefined;
    package: APIV1Read.ApiDefinitionPackage | undefined;
    formState: PlaygroundRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundRequestFormState>>;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
    openSecretsModal: () => void;
    secrets: SecretBearer[];
    slug: string | undefined;
    apiId: string | undefined;
}

export const ApiPlaygroundDrawer: FC<ApiPlaygroundDrawerProps> = ({
    endpoint,
    package: package_,
    formState,
    setFormState,
    resetWithExample,
    resetWithoutExample,
    openSecretsModal,
    secrets,
    slug,
    apiId,
}): ReactElement => {
    const { collapseApiPlayground } = useApiPlaygroundContext();

    return (
        <div className="divide-border-default-light dark:divide-border-default-dark scroll-contain flex h-full flex-col divide-y overscroll-none rounded-lg">
            <div className="flex items-stretch justify-between gap-4 px-4 py-2">
                {endpoint != null ? (
                    <PlaygroundEndpointRender endpoint={endpoint} formState={formState} />
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-accent-primary dark:text-accent-primary-dark text-sm font-semibold">
                            API Playground
                        </span>
                        <span className="bg-tag-primary dark:bg-tag-primary-dark text-accent-primary dark:text-accent-primary-dark flex h-5 items-center rounded-md px-1.5 py-1 font-mono text-xs uppercase">
                            BETA
                        </span>
                    </div>
                )}

                <div className="bg-background dark:bg-background-dark -mx-4 flex items-center gap-2 px-4">
                    <Tooltip content="Coming soon" popoverClassName="text-xs">
                        <a className="text-text-primary-light hover:text-accent-primary decoration-accent-primary dark:text-text-primary-dark dark:hover:text-accent-primary-dark dark:decoration-accent-primary-dark whitespace-nowrap text-sm font-semibold underline decoration-1 underline-offset-4 hover:decoration-2">
                            Sign in to use your API keys
                        </a>
                    </Tooltip>
                    <Button minimal={true} icon={<Cross />} onClick={collapseApiPlayground} className="-mr-2" />
                </div>
            </div>

            {endpoint != null ? (
                <ApiPlayroundContent
                    endpoint={endpoint}
                    package={package_}
                    formState={formState}
                    setFormState={setFormState}
                    resetWithExample={resetWithExample}
                    resetWithoutExample={resetWithoutExample}
                    openSecretsModal={openSecretsModal}
                    secrets={secrets}
                    slug={slug}
                    apiId={apiId}
                />
            ) : (
                <div className="flex flex-1 items-center justify-center">
                    <ApiPlaygroundEndpointSelector
                        endpoint={endpoint}
                        package={package_}
                        placeholderText="Select an endpoint to get started"
                        buttonClassName="text-base"
                        popoverPlacement="top"
                    />
                </div>
            )}
        </div>
    );
};
