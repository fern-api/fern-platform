import { EMPTY_ARRAY } from "@fern-ui/core-utils";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useFeatureFlags } from "../contexts/FeatureFlagContext";
import { useIsReady } from "../contexts/useIsReady";
import { APIS } from "../sidebar/atom";
import { ResolvedRootPackage } from "../util/resolver";
import { ApiPackageContents } from "./ApiPackageContents";

export declare namespace ApiPage {
    export interface Props {
        initialApi: ResolvedRootPackage;
        showErrors: boolean;
    }
}

export const ApiPage: React.FC<ApiPage.Props> = ({ initialApi, showErrors }) => {
    const hydrated = useIsReady();
    const { isApiScrollingDisabled } = useFeatureFlags();
    const setDefinitions = useSetAtom(APIS);
    // const definition = apis[initialApi.api];

    useEffect(() => {
        setDefinitions((prev) => ({ ...prev, [initialApi.api]: initialApi }));
    }, [initialApi, setDefinitions]);

    return (
        <div className="min-h-0 pb-36">
            <ApiPackageContents
                api={initialApi.api}
                types={initialApi.types}
                showErrors={showErrors}
                apiDefinition={initialApi}
                isLastInParentPackage={true}
                anchorIdParts={EMPTY_ARRAY}
            />

            {isApiScrollingDisabled && (
                <div className="max-w-content-width md:max-w-endpoint-width mx-4 md:mx-6 lg:mx-8">
                    {/* <BottomNavigationButtons showPrev={true} /> */}
                </div>
            )}

            {/* anchor links should get additional padding to scroll to on initial load */}
            {!hydrated && <div className="h-full" />}
        </div>
    );
};
