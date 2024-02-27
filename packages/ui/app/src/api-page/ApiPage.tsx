import { DocsV1Read } from "@fern-api/fdr-sdk";
import { PrimitiveAtom, useAtom } from "jotai";
import { useEffect } from "react";
import { FlattenedApiDefinition } from "../util/flattenApiDefinition";
import { resolveApiDefinition, ResolvedRootPackage } from "../util/resolver";
import { ApiPackageContents } from "./ApiPackageContents";
import { ApiArtifacts } from "./artifacts/ApiArtifacts";
import { areApiArtifactsNonEmpty } from "./artifacts/areApiArtifactsNonEmpty";

export declare namespace ApiPage {
    export interface Props {
        api: string;
        artifacts: DocsV1Read.ApiArtifacts | null;
        showErrors: boolean;
        fullSlug: string;
        sectionUrlSlug: string;
        skipUrlSlug: boolean;
        atomApi: PrimitiveAtom<Record<string, ResolvedRootPackage>>;
    }
}

export const ApiPage: React.FC<ApiPage.Props> = ({
    api,
    artifacts,
    showErrors,
    fullSlug,
    sectionUrlSlug,
    skipUrlSlug,
    atomApi,
}) => {
    const [definitions, setDefinitions] = useAtom(atomApi);
    const definition = definitions[api];

    useEffect(() => {
        let url = `/api/resolve-api?path=${fullSlug}&api=${api}`;
        if (!skipUrlSlug) {
            url += `&slug=${sectionUrlSlug}`;
        }
        void fetch(url).then(async (response) => {
            if (response.ok) {
                const api = (await response.json()) as FlattenedApiDefinition | null;
                if (api != null) {
                    const resolvedApi = await resolveApiDefinition(api);
                    setDefinitions((prev) => ({ ...prev, [resolvedApi.api]: resolvedApi }));
                }
            }
        });
    }, [api, fullSlug, sectionUrlSlug, setDefinitions, skipUrlSlug]);

    if (definition == null) {
        return null;
    }

    return (
        <div className="min-h-0 pb-36">
            {artifacts != null && areApiArtifactsNonEmpty(artifacts) && (
                <ApiArtifacts apiArtifacts={artifacts} apiDefinition={definition} />
            )}

            <ApiPackageContents
                api={api}
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
