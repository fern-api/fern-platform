import { DocsV1Read } from "@fern-api/fdr-sdk";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useIsReady } from "../contexts/useIsReady";
import { APIS } from "../sidebar/atom";
import { ResolvedRootPackage } from "../util/resolver";
import { ApiPackageContents } from "./ApiPackageContents";
import { ApiArtifacts } from "./artifacts/ApiArtifacts";
import { areApiArtifactsNonEmpty } from "./artifacts/areApiArtifactsNonEmpty";

export declare namespace ApiPage {
    export interface Props {
        initialApi: ResolvedRootPackage;
        artifacts: DocsV1Read.ApiArtifacts | null;
        showErrors: boolean;
    }
}

export const ApiPage: React.FC<ApiPage.Props> = ({ initialApi, artifacts, showErrors }) => {
    const hydrated = useIsReady();
    const setDefinitions = useSetAtom(APIS);
    // const definition = apis[initialApi.api];

    useEffect(() => {
        setDefinitions((prev) => ({ ...prev, [initialApi.api]: initialApi }));
    }, [initialApi, setDefinitions]);

    return (
        <div className="min-h-0 pb-36">
            {artifacts != null && areApiArtifactsNonEmpty(artifacts) && (
                <ApiArtifacts apiArtifacts={artifacts} apiDefinition={initialApi} />
            )}

            <ApiPackageContents
                api={initialApi.api}
                types={initialApi.types}
                showErrors={showErrors}
                apiDefinition={initialApi}
                isLastInParentPackage={true}
                anchorIdParts={[]}
            />

            <div className="px-4">{/* <BottomNavigationButtons /> */}</div>

            {/* anchor links should get additional padding to scroll to on initial load */}
            {!hydrated && <div className="h-full" />}
        </div>
    );
};
