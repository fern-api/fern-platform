import { Tooltip } from "@blueprintjs/core";
import { APIV1Read } from "@fern-api/fdr-sdk";
import {
    ResolvedApiDefinitionPackage,
    ResolvedEndpointDefinition,
    ResolvedNavigationItemApiSection,
} from "@fern-ui/app-utils";
import { Dispatch, FC, ReactElement, SetStateAction } from "react";
import { FernButton } from "../components/FernButton";
import { ApiPlayroundContent } from "./ApiPlaygroundContent";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";
import { ApiPlaygroundEndpointSelector } from "./ApiPlaygroundEndpointSelector";
import { PlaygroundEndpointRender } from "./PlaygroundEndpointRender";
import { SecretBearer } from "./PlaygroundSecretsModal";
import { PlaygroundRequestFormState } from "./types";

interface ApiPlaygroundDrawerProps {
    navigationItems: ResolvedNavigationItemApiSection[];
    auth: APIV1Read.ApiAuth | undefined;
    apiDefinition: ResolvedApiDefinitionPackage | undefined;
    endpoint: ResolvedEndpointDefinition | undefined;
    formState: PlaygroundRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundRequestFormState>>;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
    openSecretsModal: () => void;
    secrets: SecretBearer[];
}

export const ApiPlaygroundDrawer: FC<ApiPlaygroundDrawerProps> = ({
    navigationItems,
    auth,
    apiDefinition,
    endpoint,
    formState,
    setFormState,
    resetWithExample,
    resetWithoutExample,
    openSecretsModal,
    secrets,
}): ReactElement => {
    const { collapseApiPlayground } = useApiPlaygroundContext();

    return (
        <div className="divide-border-default-light dark:divide-border-default-dark scroll-contain flex h-full flex-col divide-y overscroll-none rounded-lg">
            <div className="flex h-10 items-stretch justify-between gap-2 px-4">
                {endpoint != null && (
                    <>
                        <div className="flex items-center">
                            <ApiPlaygroundEndpointSelector
                                apiDefinition={apiDefinition}
                                endpoint={endpoint}
                                navigationItems={navigationItems}
                                popoverPlacement="bottom-start"
                            />
                        </div>
                        <div className="bg-border-default-light dark:bg-border-default-dark h-10 w-[1px] shrink-0" />
                    </>
                )}
                {endpoint != null ? (
                    <PlaygroundEndpointRender endpoint={endpoint} formState={formState} />
                ) : (
                    <div className="flex items-center">
                        <span className="inline-flex items-baseline gap-2">
                            <span className="text-accent-primary text-sm font-semibold">API Playground</span>
                            <span className="bg-tag-primary text-accent-primary flex h-5 items-center rounded-md px-1.5 py-1 font-mono text-xs uppercase">
                                BETA
                            </span>
                        </span>
                    </div>
                )}

                <div className="bg-background dark:bg-background-dark -mx-4 flex items-center gap-2 px-4">
                    <Tooltip content="Coming soon" popoverClassName="text-xs">
                        <a className="text-text-default-light hover:text-accent-primary decoration-accent-primary dark:text-text-default-dark dark:hover:text-accent-primary-dark dark:decoration-accent-primary-dark whitespace-nowrap text-sm font-semibold underline decoration-1 underline-offset-4 hover:decoration-2">
                            Sign in to use your API keys
                        </a>
                    </Tooltip>
                    <FernButton
                        buttonStyle="minimal"
                        icon="xmark"
                        onClick={collapseApiPlayground}
                        className="-mr-2"
                        rounded
                    />
                </div>
            </div>

            {endpoint != null ? (
                <ApiPlayroundContent
                    auth={auth}
                    endpoint={endpoint}
                    formState={formState}
                    setFormState={setFormState}
                    resetWithExample={resetWithExample}
                    resetWithoutExample={resetWithoutExample}
                    openSecretsModal={openSecretsModal}
                    secrets={secrets}
                />
            ) : (
                <div className="flex flex-1 items-center justify-center">
                    <ApiPlaygroundEndpointSelector
                        navigationItems={navigationItems}
                        apiDefinition={apiDefinition}
                        endpoint={endpoint}
                        placeholderText="Select an endpoint to get started"
                        buttonClassName="text-base"
                        popoverPlacement="top"
                    />
                </div>
            )}
        </div>
    );
};
