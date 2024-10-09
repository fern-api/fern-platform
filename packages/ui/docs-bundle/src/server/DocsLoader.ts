import type { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { AuthEdgeConfig } from "@fern-ui/fern-docs-auth";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { AuthProps, withAuthProps } from "./authProps";
import { loadWithUrl } from "./loadWithUrl";
import { pruneWithBasicTokenAnonymous, pruneWithBasicTokenAuthed } from "./withBasicTokenAnonymous";

interface DocsLoaderFlags {
    isBatchStreamToggleDisabled: boolean;
    isApiScrollingDisabled: boolean;
}

export class DocsLoader {
    static for(xFernHost: string, fernToken?: string): DocsLoader {
        return new DocsLoader(xFernHost, fernToken);
    }

    private constructor(
        private xFernHost: string,
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
    private authProps: AuthProps | undefined;
    public withAuth(authConfig: AuthEdgeConfig | undefined, authProps?: AuthProps): DocsLoader {
        this.authConfig = authConfig;
        if (authProps) {
            this.authProps = authProps;
        }
        return this;
    }

    private async loadAuth(): Promise<[AuthProps | undefined, AuthEdgeConfig | undefined]> {
        if (!this.authConfig) {
            this.authConfig = await getAuthEdgeConfig(this.xFernHost);
        }
        if (!this.authConfig || !this.fernToken || (this.authProps && this.authConfig)) {
            return [this.authProps, this.authConfig];
        }
        try {
            return [await withAuthProps(this.authConfig, this.fernToken), this.authConfig];
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            return [undefined, this.authConfig];
        }
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
            const [authProps] = await this.loadAuth();

            const response = await loadWithUrl(this.xFernHost, authProps);

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
        const [auth, authConfig] = await this.loadAuth();
        let node = await this.unprunedRoot();

        // if the user is not authenticated, and the page requires authentication, prune the navigation tree
        // to only show pages that are allowed to be viewed without authentication.
        // note: the middleware will not show this page at all if the user is not authenticated.
        if (node) {
            try {
                if (authConfig?.type === "basic_token_verification") {
                    // TODO: store this in cache
                    node = !auth
                        ? pruneWithBasicTokenAnonymous(authConfig, node)
                        : pruneWithBasicTokenAuthed(authConfig, node);
                }
            } catch (e) {
                // TODO: sentry
                // eslint-disable-next-line no-console
                console.error(e);
                return undefined;
            }
        }

        return node;
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
