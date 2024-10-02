import { EMPTY_ARRAY } from "@fern-ui/core-utils";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { DEPRECATED_APIS_ATOM, useIsReady } from "../atoms";
import { ApiPageContext } from "../contexts/api-page";
import type { ResolvedRootPackage } from "../resolver/types";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";
import { ApiPackageContents } from "./ApiPackageContents";

export declare namespace ApiReferencePage {
    export interface Props {
        initialApi: ResolvedRootPackage;
        showErrors: boolean;
    }
}

export const ApiReferencePage: React.FC<ApiReferencePage.Props> = ({ initialApi, showErrors }) => {
    const hydrated = useIsReady();
    const setDefinitions = useSetAtom(DEPRECATED_APIS_ATOM);
    useEffect(() => {
        setDefinitions((prev) => ({ ...prev, [initialApi.api]: initialApi }));
    }, [initialApi, setDefinitions]);

    return (
        <ApiPageContext.Provider value={true}>
            <ApiPackageContents
                api={initialApi.api}
                types={initialApi.types}
                showErrors={showErrors}
                apiDefinition={initialApi}
                isLastInParentPackage={true}
                anchorIdParts={EMPTY_ARRAY}
            />

            {/* anchor links should get additional padding to scroll to on initial load */}
            {!hydrated && <div className="h-full" />}
            <div className="pb-36" />
            <BuiltWithFern className="w-fit mx-auto my-8" />
        </ApiPageContext.Provider>
    );
};
