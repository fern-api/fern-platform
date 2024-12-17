import { ApiDefinition, FdrClient, FernNavigation } from "@fern-api/fdr-sdk";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { mapValues } from "es-toolkit/object";

export interface LoadDocsWithUrlPayload {
    /**
     * FDR environment to use. (either `https://registry-dev2.buildwithfern.com` or `https://registry.buildwithfern.com`)
     */
    environment: string;

    /**
     * The shared secret token use to authenticate with FDR.
     */
    fernToken: string;

    /**
     * The domain to load docs for.
     */
    domain: string;

    // feature flags
    isBatchStreamToggleDisabled?: boolean;
    isApiScrollingDisabled?: boolean;
    useJavaScriptAsTypeScript?: boolean;
    alwaysEnableJavaScriptFetch?: boolean;
    usesApplicationJsonInFormDataValue?: boolean;
}

interface LoadDocsWithUrlResponse {
    org_id: FernNavigation.OrgId;
    root: FernNavigation.RootNode;
    pages: Record<FernNavigation.PageId, string>;
    apis: Record<ApiDefinition.ApiDefinitionId, ApiDefinition.ApiDefinition>;
    domain: string;
}

export async function loadDocsWithUrl(payload: LoadDocsWithUrlPayload): Promise<LoadDocsWithUrlResponse> {
    const client = new FdrClient({
        environment: payload.environment,
        token: payload.fernToken,
    });

    const docs = await client.docs.v2.read.getDocsForUrl({ url: ApiDefinition.Url(payload.domain) });

    if (!docs.ok) {
        throw new Error(`Failed to get docs for ${payload.domain}: ${docs.error.error}`);
    }

    const org = await client.docs.v2.read.getOrganizationForUrl({ url: ApiDefinition.Url(payload.domain) });
    if (!org.ok) {
        throw new Error(`Failed to get org for ${payload.domain}: ${org.error.error}`);
    }

    const domain = new URL(withDefaultProtocol(payload.domain));

    const root = FernNavigation.utils.toRootNode(
        docs.body,
        payload.isBatchStreamToggleDisabled ?? false,
        payload.isApiScrollingDisabled ?? false,
    );

    // migrate pages
    const pages = mapValues(docs.body.definition.pages, (page) => page.markdown);

    // migrate apis
    const apis = {
        ...mapValues(docs.body.definition.apis, (api) =>
            ApiDefinition.ApiDefinitionV1ToLatest.from(api, {
                useJavaScriptAsTypeScript: payload.useJavaScriptAsTypeScript ?? false,
                alwaysEnableJavaScriptFetch: payload.alwaysEnableJavaScriptFetch ?? false,
                usesApplicationJsonInFormDataValue: payload.usesApplicationJsonInFormDataValue ?? false,
            }).migrate(),
        ),
        ...docs.body.definition.apisV2,
    };

    return { org_id: org.body, root, pages, apis, domain: domain.host };
}
