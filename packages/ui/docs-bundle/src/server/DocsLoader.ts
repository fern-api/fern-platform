import type { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk";
import { ApiDefinition, ApiDefinitionV1ToLatest } from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { AuthEdgeConfig } from "@fern-ui/fern-docs-auth";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { ApiDefinitionLoader } from "@fern-ui/fern-docs-server";
import { getAuthState, type AuthState } from "./auth/getAuthState";
import { loadWithUrl } from "./loadWithUrl";
import { pruneWithAuthState } from "./withRbac";

interface DocsLoaderFlags {
    isBatchStreamToggleDisabled: boolean;
    isApiScrollingDisabled: boolean;

    // for api definition:
    useJavaScriptAsTypeScript: boolean;
    alwaysEnableJavaScriptFetch: boolean;
    usesApplicationJsonInFormDataValue: boolean;
}

export class DocsLoader {
    static for(domain: string, host: string, fernToken?: string): DocsLoader {
        return new DocsLoader(domain, host, fernToken);
    }

    private constructor(
        private domain: string,
        private host: string,
        private fernToken: string | undefined,
    ) {}

    private featureFlags: DocsLoaderFlags = {
        isBatchStreamToggleDisabled: false,
        isApiScrollingDisabled: false,
        useJavaScriptAsTypeScript: false,
        alwaysEnableJavaScriptFetch: false,
        usesApplicationJsonInFormDataValue: false,
    };
    public withFeatureFlags(featureFlags: DocsLoaderFlags): DocsLoader {
        this.featureFlags = featureFlags;
        return this;
    }

    private authConfig: AuthEdgeConfig | undefined;
    private authState: AuthState | undefined;
    public withAuth(authConfig: AuthEdgeConfig | undefined, authState?: AuthState): DocsLoader {
        this.authConfig = authConfig;
        if (authState) {
            this.authState = authState;
        }
        return this;
    }

    private async loadAuth(): Promise<[AuthState, AuthEdgeConfig | undefined]> {
        if (!this.authConfig) {
            this.authConfig = await getAuthEdgeConfig(this.domain);
        }
        if (this.authState) {
            return [this.authState, this.authConfig];
        }
        return [
            await getAuthState(this.domain, this.host, this.fernToken, undefined, this.authConfig),
            this.authConfig,
        ];
    }

    public async isAuthed(): Promise<boolean> {
        const [authState] = await this.loadAuth();
        return authState.authed;
    }

    #loadForDocsUrlResponse: DocsV2Read.LoadDocsForUrlResponse | undefined;
    #error: DocsV2Read.getDocsForUrl.Error | undefined;

    get error(): DocsV2Read.getDocsForUrl.Error | undefined {
        return this.#error;
    }

    public withLoadDocsForUrlResponse(loadForDocsUrlResponse: DocsV2Read.LoadDocsForUrlResponse): DocsLoader {
        this.#loadForDocsUrlResponse = loadForDocsUrlResponse;
        return this;
    }

    public async getApiDefinition(key: FernNavigation.ApiDefinitionId): Promise<ApiDefinition | undefined> {
        const res = await this.loadDocs();
        if (!res) {
            return undefined;
        }
        const v1 = res.definition.apis[key];
        const latest =
            res.definition.apisV2[key] ??
            (v1 != null ? ApiDefinitionV1ToLatest.from(v1, this.featureFlags).migrate() : undefined);
        if (!latest) {
            return undefined;
        }
        return ApiDefinitionLoader.create(this.domain, key)
            .withApiDefinition(latest)
            .withFlags(this.featureFlags)
            .withResolveDescriptions(false)
            .withEnvironment(process.env.NEXT_PUBLIC_FDR_ORIGIN)
            .load();
    }

    private async loadDocs(): Promise<DocsV2Read.LoadDocsForUrlResponse | undefined> {
        if (!this.#loadForDocsUrlResponse) {
            const response = await loadWithUrl(this.domain);

            if (response.ok) {
                this.#loadForDocsUrlResponse = response.body;
            } else {
                this.#error = response.error;
            }
        }
        return this.#loadForDocsUrlResponse;
    }

    public async unprunedRoot(): Promise<FernNavigation.RootNode | undefined> {
        const docs = await this.loadDocs();

        if (!docs) {
            return undefined;
        }

        return FernNavigation.utils.toRootNode(
            docs,
            this.featureFlags.isBatchStreamToggleDisabled,
            this.featureFlags.isApiScrollingDisabled,
        );
    }

    public async root(): Promise<FernNavigation.RootNode | undefined> {
        const [authState, authConfig] = await this.loadAuth();
        let root = await this.unprunedRoot();

        // if the user is not authenticated, and the page requires authentication, prune the navigation tree
        // to only show pages that are allowed to be viewed without authentication.
        // note: the middleware will not show this page at all if the user is not authenticated.
        if (root && authConfig) {
            try {
                // TODO: store this in cache
                root = pruneWithAuthState(authState, authConfig, root);
            } catch (e) {
                // TODO: sentry
                // eslint-disable-next-line no-console
                console.error(e);
                return undefined;
            }
        }

        return root;
    }

    // NOTE: authentication is based on the navigation nodes, so we don't need to check it here,
    // as long as these pages are NOT shipped to the client-side.
    public async pages(): Promise<Record<FernNavigation.PageId, DocsV1Read.PageContent>> {
        const docs = await this.loadDocs();
        return docs?.definition.pages ?? {};
    }

    public async files(): Promise<Record<FernNavigation.FileId, DocsV1Read.File_>> {
        const docs = await this.loadDocs();
        return docs?.definition.filesV2 ?? {};
    }
}
