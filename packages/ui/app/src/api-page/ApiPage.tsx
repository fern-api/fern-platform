import { EMPTY_ARRAY } from "@fern-ui/core-utils";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { APIS } from "../atoms/apis";
import { useIsReady } from "../atoms/viewport";
import { ApiPageContext } from "../contexts/useApiPageContext";
import { ResolvedRootPackage } from "../resolver/types";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";
import { ApiPackageContents } from "./ApiPackageContents";

export declare namespace ApiPage {
    export interface Props {
        initialApi: ResolvedRootPackage;
        showErrors: boolean;
    }
}

export const ApiPage: React.FC<ApiPage.Props> = ({ initialApi, showErrors }) => {
    const hydrated = useIsReady();
    const setDefinitions = useSetAtom(APIS);

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

            {/* {isApiScrollingDisabled && (
                <div className="mx-4 max-w-content-width md:mx-6 md:max-w-endpoint-width lg:mx-8">
                    <BottomNavigationButtons showPrev={true} />
                </div>
            )} */}

            {/* anchor links should get additional padding to scroll to on initial load */}
            {!hydrated && <div className="h-full" />}
            <div className="pb-36" />
            <BuiltWithFern className="w-fit mx-auto my-8" />
        </ApiPageContext.Provider>
    );
};
