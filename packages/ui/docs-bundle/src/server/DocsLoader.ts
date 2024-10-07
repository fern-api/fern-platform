import type { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { AuthEdgeConfig, FernUser } from "@fern-ui/ui/auth";
import { verifyFernJWTConfig } from "./auth/FernJWT";
import { getAuthEdgeConfig } from "./auth/getAuthEdgeConfig";
import { AuthProps } from "./authProps";
import { loadWithUrl } from "./loadWithUrl";
import { pruneWithBasicTokenPublic } from "./withBasicTokenPublic";

export class DocsLoader {
    static for(xFernHost: string, fernToken: string | undefined): DocsLoader {
        return new DocsLoader(xFernHost, fernToken);
    }

    private constructor(
        private xFernHost: string,
        private fernToken: string | undefined,
    ) {}

    private user: FernUser | undefined;
    private auth: AuthEdgeConfig | undefined;
    public withAuth(auth: AuthEdgeConfig, user: FernUser | undefined): DocsLoader {
        this.auth = auth;
        this.user = user;
        return this;
    }

    private async loadAuth(): Promise<{
        authConfig: AuthEdgeConfig | undefined;
        user: FernUser | undefined;
    }> {
        if (!this.auth) {
            this.auth = await getAuthEdgeConfig(this.xFernHost);

            try {
                if (this.fernToken) {
                    this.user = await verifyFernJWTConfig(this.fernToken, this.auth);
                }
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }
        }
        return {
            authConfig: this.auth,
            user: this.user,
        };
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
            const { user } = await this.loadAuth();
            const authProps: AuthProps | undefined =
                user && this.fernToken ? { user, token: this.fernToken } : undefined;

            const response = await loadWithUrl(this.xFernHost, authProps);

            if (response.ok) {
                this.#loadForDocsUrlResponse = response.body;
            } else {
                this.#error = response.error;
            }
        }
        return this.#loadForDocsUrlResponse;
    }

    public async root(): Promise<FernNavigation.RootNode | undefined> {
        const { authConfig, user } = await this.loadAuth();
        const docs = await this.loadDocs();

        if (!docs) {
            return undefined;
        }

        let node = FernNavigation.utils.toRootNode(docs);

        // If the domain is basic_token_verification, we only want to include slugs that are allowed
        if (authConfig?.type === "basic_token_verification" && !user) {
            try {
                // TODO: store this in cache
                node = pruneWithBasicTokenPublic(authConfig, node);
            } catch (e) {
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
