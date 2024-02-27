import { DocsV1Read } from "@fern-api/fdr-sdk";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
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
        fullSlug: string;
        sectionUrlSlug: string;
        skipUrlSlug: boolean;
    }
}

export const ApiPage: React.FC<ApiPage.Props> = ({
    initialApi,
    artifacts,
    showErrors,
    // fullSlug,
    // sectionUrlSlug,
    // skipUrlSlug,
}) => {
    const setDefinitions = useSetAtom(APIS);
    // const definition = apis[initialApi.api];

    useEffect(() => {
        setDefinitions((prev) => ({ ...prev, [initialApi.api]: initialApi }));
    }, [initialApi, setDefinitions]);

    // useEffect(() => {
    //     void resolveApiDefinition(initialApi).then((resolvedApi) => {
    //         pinScrollPositionToRoute(`/${fullSlug}`, () => {
    //             setDefinitions((prev) => ({ ...prev, [resolvedApi.api]: resolvedApi }));
    //         });
    //     });
    // }, [fullSlug, initialApi, setDefinitions]);

    // useEffect(() => {
    //     let url = `/api/resolve-api?path=${fullSlug}&api=${initialApi.api}`;
    //     if (!skipUrlSlug) {
    //         url += `&slug=${sectionUrlSlug}`;
    //     }
    //     void fetch(url).then(async (response) => {
    //         if (response.ok) {
    //             const api = (await response.json()) as FlattenedApiDefinition | null;
    //             if (api != null) {
    //                 const resolvedApi = resolveApiDefinition(api);

    //                 pinScrollPositionToRoute(`/${fullSlug}`, () => {
    //                     setDefinitions((prev) => ({ ...prev, [resolvedApi.api]: resolvedApi }));
    //                 });
    //             }
    //         }
    //     });
    // }, [fullSlug, initialApi.api, sectionUrlSlug, setDefinitions, skipUrlSlug]);

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
        </div>
    );
};
