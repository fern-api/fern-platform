import { EMPTY_ARRAY } from "@fern-ui/core-utils";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useFeatureFlags } from "../contexts/FeatureFlagContext";
import { useIsReady } from "../contexts/useIsReady";
import { ResolvedRootPackage } from "../resolver/types";
import { APIS } from "../sidebar/atom";
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

    useEffect(() => {
        setDefinitions((prev) => ({ ...prev, [initialApi.api]: initialApi }));
    }, [initialApi, setDefinitions]);

    return (
        <div className="min-h-0 pb-36 m-6 bg-white shadow-google">
            <ApiPackageContents
                api={initialApi.api}
                types={initialApi.types}
                showErrors={showErrors}
                apiDefinition={initialApi}
                isLastInParentPackage={true}
                anchorIdParts={EMPTY_ARRAY}
            />

            {isApiScrollingDisabled && (
                <div className="mx-4 max-w-content-width md:mx-6 md:max-w-endpoint-width lg:mx-8">
                    {/* <BottomNavigationButtons showPrev={true} /> */}
                </div>
            )}

            {/* anchor links should get additional padding to scroll to on initial load */}
            {!hydrated && <div className="h-full" />}
        </div>
    );
};
