import { DocsV2Read } from "../../client";
import { NavigationConfigConverter } from "../converters/NavigationConfigConverter";

export function convertLoadDocsForUrlResponse(response: DocsV2Read.LoadDocsForUrlResponse) {
    return NavigationConfigConverter.convert(
        response.definition.config.navigation,
        response.definition.apis,
        response.baseUrl.basePath,
    );
}
