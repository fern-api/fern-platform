import { mapValues } from "es-toolkit/object";

import { ApiDefinition } from "../..";
import { DocsV2Read } from "../../client";

export function toApis(docs: DocsV2Read.LoadDocsForUrlResponse) {
  return {
    ...mapValues(docs.definition.apis, (api) =>
      ApiDefinition.ApiDefinitionV1ToLatest.from(api, {
        useJavaScriptAsTypeScript: false,
        alwaysEnableJavaScriptFetch: false,
        usesApplicationJsonInFormDataValue: false,
      }).migrate()
    ),
    ...docs.definition.apisV2,
  };
}
