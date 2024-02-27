import { DocsV1Read } from "@fern-api/fdr-sdk";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { useNavigationContext } from "../navigation-context";
import { APIS } from "../sidebar/atom";
import { FlattenedApiDefinition } from "../util/flattenApiDefinition";
import { resolveApiDefinition, ResolvedRootPackage } from "../util/resolver";
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
    fullSlug,
    sectionUrlSlug,
    skipUrlSlug,
}) => {
    const { onScrollToPath } = useNavigationContext();
    const [apis, setDefinitions] = useAtom(APIS);
    const definition = apis[initialApi.api] ?? initialApi;

    useEffect(() => {
        let url = `/api/resolve-api?path=${fullSlug}&api=${initialApi.api}`;
        if (!skipUrlSlug) {
            url += `&slug=${sectionUrlSlug}`;
        }
        void fetch(url).then(async (response) => {
            if (response.ok) {
                const api = (await response.json()) as FlattenedApiDefinition | null;
                if (api != null) {
                    const resolvedApi = await resolveApiDefinition(api);
                    setDefinitions((prev) => ({ ...prev, [resolvedApi.api]: resolvedApi }));
                    // onScrollToPath(fullSlug);
                }
            }
        });
    }, [fullSlug, initialApi.api, onScrollToPath, sectionUrlSlug, setDefinitions, skipUrlSlug]);

    return (
        <div className="min-h-0 pb-36">
            {artifacts != null && areApiArtifactsNonEmpty(artifacts) && (
                <ApiArtifacts apiArtifacts={artifacts} apiDefinition={definition} />
            )}

            <ApiPackageContents
                api={definition.api}
                types={definition.types}
                showErrors={showErrors}
                apiDefinition={definition}
                isLastInParentPackage={true}
                anchorIdParts={[]}
            />

            <div className="px-4">{/* <BottomNavigationButtons /> */}</div>
        </div>
    );
};
