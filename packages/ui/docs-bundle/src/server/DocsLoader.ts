import type { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { AuthEdgeConfig } from "@fern-ui/ui/auth";
import { verifyFernJWTConfig } from "./auth/FernJWT";
import { getAuthEdgeConfig } from "./auth/getAuthEdgeConfig";
import { AuthProps } from "./authProps";
import { loadWithUrl } from "./loadWithUrl";
import { pruneWithBasicTokenPublic } from "./withBasicTokenPublic";

export class DocsLoader {
    static for(xFernHost: string, fern_token: string | undefined): DocsLoader {
        return new DocsLoader(xFernHost, fern_token);
    }

    private constructor(
        private xFernHost: string,
        private fern_token: string | undefined,
    ) {}

    private authenticated: boolean = false;
    private auth: AuthEdgeConfig | undefined;
    public withAuth(auth: AuthEdgeConfig): DocsLoader {
        this.auth = auth;
        return this;
    }

    private async loadAuth(): Promise<AuthEdgeConfig | undefined> {
        if (!this.auth) {
            this.auth = await getAuthEdgeConfig(this.xFernHost);
        }
        return this.auth;
    }

    private loadForDocsUrlResponse: DocsV2Read.LoadDocsForUrlResponse | undefined;
    public withLoadDocsForUrlResponse(loadForDocsUrlResponse: DocsV2Read.LoadDocsForUrlResponse): DocsLoader {
        this.loadForDocsUrlResponse = loadForDocsUrlResponse;
        return this;
    }
    private async loadDocs(): Promise<DocsV2Read.LoadDocsForUrlResponse | undefined> {
        if (!this.loadForDocsUrlResponse) {
            const auth = await this.loadAuth();
            let authProps: AuthProps | undefined;

            try {
                if (this.fern_token) {
                    const user = await verifyFernJWTConfig(this.fern_token, auth);
                    this.authenticated = true;
                    authProps = {
                        user,
                        token: this.fern_token,
                    };
                }
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }

            const response = await loadWithUrl(this.xFernHost, authProps);
            if (response.ok) {
                this.loadForDocsUrlResponse = response.body;
            }
        }
        return this.loadForDocsUrlResponse;
    }

    public async root(): Promise<FernNavigation.RootNode | undefined> {
        const auth = await this.loadAuth();
        const docs = await this.loadDocs();

        if (!docs) {
            return undefined;
        }

        let node = FernNavigation.utils.toRootNode(docs);

        // If the domain is basic_token_verification, we only want to include slugs that are allowed
        if (auth?.type === "basic_token_verification" && !this.authenticated) {
            try {
                // TODO: store this in cache
                node = pruneWithBasicTokenPublic(auth, node);
            } catch (e) {
                return undefined;
            }
        }

        return node;
    }

    public async pages(): Promise<Record<FernNavigation.PageId, DocsV1Read.PageContent>> {
        const docs = await this.loadDocs();
        return docs?.definition.pages ?? {};
    }

    public async files(): Promise<Record<FernNavigation.FileId, DocsV1Read.File_>> {
        const docs = await this.loadDocs();
        return docs?.definition.filesV2 ?? {};
    }
}
