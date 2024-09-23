import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { EMPTY_ARRAY } from "@fern-ui/core-utils";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { APIS_ATOM, NAVIGATION_NODES_ATOM, useIsReady } from "../atoms";
import { ApiPageContext } from "../contexts/api-page";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";
import { ApiPackageContents } from "./ApiPackageContents";

export declare namespace ApiReferencePage {
    export interface Props {
        apiDefinition: ApiDefinition.ApiDefinition;
        showErrors: boolean;
    }
}

export const ApiReferencePage: React.FC<ApiReferencePage.Props> = ({ apiDefinition, showErrors }) => {
    const node = useAtomValue(NAVIGATION_NODES_ATOM).get(FernNavigation.NodeId(apiDefinition.nodeId));
    const hydrated = useIsReady();
    const setDefinitions = useSetAtom(APIS_ATOM);
    useEffect(() => {
        setDefinitions((prev) => ({ ...prev, [apiDefinition.id]: apiDefinition }));
    }, [apiDefinition, setDefinitions]);

    return (
        <ApiPageContext.Provider value={true}>
            {node?.type === "apiReference" && (
                <ApiPackageContents
                    api={apiDefinition.id}
                    types={apiDefinition.types}
                    showErrors={showErrors}
                    node={node}
                    isLastInParentPackage={true}
                    anchorIdParts={EMPTY_ARRAY}
                />
            )}

            {/* anchor links should get additional padding to scroll to on initial load */}
            {!hydrated && <div className="h-full" />}
            <div className="pb-36" />
            <BuiltWithFern className="w-fit mx-auto my-8" />
        </ApiPageContext.Provider>
    );
};
