import { OpenAPIV3_1 } from "openapi-types";
import { isReferenceObject } from "../../3.1/guards/isReferenceObject";
import { resolveReference } from "./resolveReference";

export function resolveSecurityScheme(
    securitySchemeId: string,
    document: OpenAPIV3_1.Document
): OpenAPIV3_1.SecuritySchemeObject | undefined {
    const securityScheme =
        document.components?.securitySchemes?.[securitySchemeId];
    if (securityScheme == null) {
        return undefined;
    }
    if (isReferenceObject(securityScheme)) {
        return resolveReference<OpenAPIV3_1.SecuritySchemeObject | undefined>(
            securityScheme,
            document,
            undefined
        );
    }

    return securityScheme;
}
