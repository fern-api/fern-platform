import { mapValues } from "es-toolkit/object";
import { ApiDefinition } from "../..";
import { DocsV2Read } from "../../client";

export async function toApis(
  docs: DocsV2Read.LoadDocsForUrlResponse,
  getPresignedDocsAssetsDownloadUrl: ({
    key,
    isPrivate,
  }: {
    key: string;
    isPrivate: boolean;
  }) => Promise<string>
) {
  return {
    ...mapValues(docs.definition.apis, (api) =>
      ApiDefinition.ApiDefinitionV1ToLatest.from(api, {
        useJavaScriptAsTypeScript: false,
        alwaysEnableJavaScriptFetch: false,
        usesApplicationJsonInFormDataValue: false,
      }).migrate()
    ),
    ...Object.fromEntries(
      await Promise.all(
        Object.entries(docs.definition.apisV2 ?? {}).map(async ([key, def]) => {
          if (typeof def === "string") {
            const url = await getPresignedDocsAssetsDownloadUrl({
              key: def,
              isPrivate: true,
            });
            const response = await fetch(url.toString());
            const apiDefinition = await response.json();
            return [key, apiDefinition as ApiDefinition.ApiDefinition];
          } else {
            return [key, def];
          }
        })
      )
    ),
  };
}
