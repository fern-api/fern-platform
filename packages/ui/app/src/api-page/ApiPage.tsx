import { DocsV1Read } from "@fern-api/fdr-sdk";
import { useEffect, useState } from "react";
import { FlattenedApiDefinition } from "../util/flattenApiDefinition";
import { resolveApiDefinition, ResolvedRootPackage } from "../util/resolver";
import { ApiPackageContents } from "./ApiPackageContents";
import { ApiArtifacts } from "./artifacts/ApiArtifacts";
import { areApiArtifactsNonEmpty } from "./artifacts/areApiArtifactsNonEmpty";

export declare namespace ApiPage {
    export interface Props {
        apiDefinition: ResolvedRootPackage;
        artifacts: DocsV1Read.ApiArtifacts | null;
        showErrors: boolean;
        fullSlug: string;
        sectionUrlSlug: string;
        skipUrlSlug: boolean;
    }
}

export const ApiPage: React.FC<ApiPage.Props> = ({
    apiDefinition,
    artifacts,
    showErrors,
    fullSlug,
    sectionUrlSlug,
    skipUrlSlug,
}) => {
    const [definition, setDefinition] = useState<ResolvedRootPackage>(apiDefinition);

    useEffect(() => {
        let url = `/api/resolve-api?path=${fullSlug}&api=${apiDefinition.api}`;
        if (!skipUrlSlug) {
            url += `&slug=${sectionUrlSlug}`;
        }
        void fetch(url).then(async (response) => {
            if (response.ok) {
                const api = (await response.json()) as FlattenedApiDefinition | null;
                if (api != null) {
                    const resolvedApi = await resolveApiDefinition(api);
                    setDefinition(resolvedApi);
                }
            }
        });
    }, [apiDefinition.api, fullSlug, sectionUrlSlug, skipUrlSlug]);

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
