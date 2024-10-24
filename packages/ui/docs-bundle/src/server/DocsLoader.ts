import type { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { AuthEdgeConfig } from "@fern-ui/fern-docs-auth";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { getAuthState, type AuthState } from "./auth/getAuthState";
import { loadWithUrl } from "./loadWithUrl";
import { pruneWithBasicTokenAnonymous, pruneWithBasicTokenAuthed } from "./withBasicTokenAnonymous";

interface DocsLoaderFlags {
    isBatchStreamToggleDisabled: boolean;
    isApiScrollingDisabled: boolean;
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

    #loadForDocsUrlResponse: DocsV2Read.LoadDocsForUrlResponse | undefined;
    #error: DocsV2Read.getDocsForUrl.Error | undefined;

    get error(): DocsV2Read.getDocsForUrl.Error | undefined {
        return this.#error;
    }

    public withLoadDocsForUrlResponse(loadForDocsUrlResponse: DocsV2Read.LoadDocsForUrlResponse): DocsLoader {
        this.#loadForDocsUrlResponse = loadForDocsUrlResponse;
        return this;
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
        if (root) {
            try {
                if (authConfig?.type === "basic_token_verification") {
                    // TODO: store this in cache
                    root = authState.authed
                        ? pruneWithBasicTokenAuthed(authConfig, root, toAudience(authState.user.audience))
                        : pruneWithBasicTokenAnonymous(authConfig, root);
                }
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

function toAudience(audience: string | string[] | undefined): string[] {
    if (typeof audience === "string") {
        return [audience];
    }
    return audience ?? [];
}
