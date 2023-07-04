import { v4 as uuid } from "uuid";
import type { FernRegistry } from "../../generated";
import { convertMarkdownToText, type WithoutQuestionMarks } from "../../util";
import { type AlgoliaSearchRecord } from "./AlgoliaService";

type ApiDefinitionLoader = (apiDefinitionId: string) => Promise<FernRegistry.api.v1.db.DbApiDefinition | null>;

export async function generateAlgoliaRecords(
    docsDefinition: WithoutQuestionMarks<FernRegistry.docs.v1.db.DocsDefinitionDb.V2>,
    loadApiDefinition: ApiDefinitionLoader
) {
    const records = await Promise.all(
        docsDefinition.config.navigation.items.map((item) =>
            getAlgoliaRecordsForNavigationItem(docsDefinition, loadApiDefinition, [], [], item)
        )
    );
    return records.flat(1);
}

async function getAlgoliaRecordsForNavigationItem(
    docsDefinition: WithoutQuestionMarks<FernRegistry.docs.v1.db.DocsDefinitionDb.V2>,
    loadApiDefinition: ApiDefinitionLoader,
    cumulativeSlugs: string[],
    cumulativeRecords: AlgoliaSearchRecord[],
    item: FernRegistry.docs.v1.read.NavigationItem
) {
    if (item.type === "section") {
        const section = item;
        await Promise.all(
            section.items.map(async (item) => {
                return await getAlgoliaRecordsForNavigationItem(
                    docsDefinition,
                    loadApiDefinition,
                    [...cumulativeSlugs, section.urlSlug],
                    cumulativeRecords,
                    item
                );
            })
        );
    } else if (item.type === "api") {
        const api = item;
        const apiId = api.api;
        const apiDef = await loadApiDefinition(apiId);
        if (apiDef) {
            const apiRecords = getAlgoliaRecordsForApiDefinition([...cumulativeSlugs, item.urlSlug], apiDef);
            cumulativeRecords.push(...apiRecords);
        }
    } else {
        const page = item;
        const pageContent = docsDefinition.pages[page.id];
        if (pageContent) {
            const path = [...cumulativeSlugs, page.urlSlug].join("/");
            const processedContent = convertMarkdownToText(pageContent.markdown);
            cumulativeRecords.push({
                objectID: uuid(),
                type: "page",
                path,
                title: page.title,
                subtitle: processedContent,
            });
        }
    }
    return cumulativeRecords;
}

function getAlgoliaRecordsForApiDefinition(
    cumulativeSlugs: string[],
    apiDef: FernRegistry.api.v1.db.DbApiDefinition
): AlgoliaSearchRecord[] {
    const apiUrlSlug = cumulativeSlugs.join("/");
    const { subpackages } = apiDef;
    const records: AlgoliaSearchRecord[] = [];
    Object.values(subpackages).forEach((subpackage) => {
        subpackage.endpoints.forEach((endpoint) => {
            if (endpoint.name || endpoint.description) {
                const path = [apiUrlSlug, subpackage.urlSlug, endpoint.urlSlug].join("/");
                const processedDescription = endpoint.description ? convertMarkdownToText(endpoint.description) : "";
                records.push({
                    objectID: uuid(),
                    type: "endpoint",
                    title: endpoint.name ?? "",
                    subtitle: processedDescription,
                    path,
                });
            }
        });
    });
    return records;
}
