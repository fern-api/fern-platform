/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as environments from "../../../../../../../../environments";
import * as core from "../../../../../../../../core";
import * as FernRegistry from "../../../../../../../index";
import urlJoin from "url-join";

export declare namespace Write {
    interface Options {
        environment?: core.Supplier<environments.FernRegistryEnvironment | string>;
        token?: core.Supplier<core.BearerToken | undefined>;
    }

    interface RequestOptions {
        /** The maximum time to wait for a response in seconds. */
        timeoutInSeconds?: number;
        /** The number of times to retry the request. Defaults to 2. */
        maxRetries?: number;
        /** A hook to abort the request. */
        abortSignal?: AbortSignal;
        /** Additional headers to include in the request. */
        headers?: Record<string, string>;
    }
}

export class Write {
    constructor(protected readonly _options: Write.Options = {}) {}

    /**
     * @param {FernRegistry.docs.v2.write.StartDocsRegisterRequestV2} request
     * @param {Write.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.docs.v2.write.startDocsRegister({
     *         domain: "domain",
     *         customDomains: ["customDomains", "customDomains"],
     *         authConfig: undefined,
     *         orgId: FernRegistry.OrgId("orgId"),
     *         apiId: FernRegistry.ApiId("apiId"),
     *         filepaths: [FernRegistry.docs.v1.write.FilePath("filepaths"), FernRegistry.docs.v1.write.FilePath("filepaths")],
     *         images: undefined
     *     })
     */
    public async startDocsRegister(
        request: FernRegistry.docs.v2.write.StartDocsRegisterRequestV2,
        requestOptions?: Write.RequestOptions
    ): Promise<
        core.APIResponse<
            FernRegistry.docs.v1.write.StartDocsRegisterResponse,
            FernRegistry.docs.v2.write.startDocsRegister.Error
        >
    > {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernRegistryEnvironment.Prod,
                "/v2/registry/docs/v2/init"
            ),
            method: "POST",
            headers: {
                Authorization: await this._getAuthorizationHeader(),
                "X-Fern-Language": "JavaScript",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            requestType: "json",
            body: request,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : undefined,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return {
                ok: true,
                body: _response.body as FernRegistry.docs.v1.write.StartDocsRegisterResponse,
            };
        }

        if (_response.error.reason === "status-code") {
            switch ((_response.error.body as FernRegistry.docs.v2.write.startDocsRegister.Error)?.error) {
                case "UnauthorizedError":
                case "UnavailableError":
                case "UserNotInOrgError":
                case "InvalidDomainError":
                case "InvalidCustomDomainError":
                case "DomainBelongsToAnotherOrgError":
                case "InvalidURLError":
                    return {
                        ok: false,
                        error: _response.error.body as FernRegistry.docs.v2.write.startDocsRegister.Error,
                    };
            }
        }

        return {
            ok: false,
            error: FernRegistry.docs.v2.write.startDocsRegister.Error._unknown(_response.error),
        };
    }

    /**
     * @param {FernRegistry.docs.v2.write.StartDocsPreviewRegisterRequestV2} request
     * @param {Write.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.docs.v2.write.startDocsPreviewRegister({
     *         basePath: undefined,
     *         orgId: FernRegistry.OrgId("orgId"),
     *         authConfig: undefined,
     *         filepaths: [FernRegistry.docs.v1.write.FilePath("filepaths"), FernRegistry.docs.v1.write.FilePath("filepaths")],
     *         images: undefined
     *     })
     */
    public async startDocsPreviewRegister(
        request: FernRegistry.docs.v2.write.StartDocsPreviewRegisterRequestV2,
        requestOptions?: Write.RequestOptions
    ): Promise<
        core.APIResponse<
            FernRegistry.docs.v2.write.StartDocsPreviewRegisterResponse,
            FernRegistry.docs.v2.write.startDocsPreviewRegister.Error
        >
    > {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernRegistryEnvironment.Prod,
                "/v2/registry/docs/preview/init"
            ),
            method: "POST",
            headers: {
                Authorization: await this._getAuthorizationHeader(),
                "X-Fern-Language": "JavaScript",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            requestType: "json",
            body: request,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : undefined,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return {
                ok: true,
                body: _response.body as FernRegistry.docs.v2.write.StartDocsPreviewRegisterResponse,
            };
        }

        if (_response.error.reason === "status-code") {
            switch ((_response.error.body as FernRegistry.docs.v2.write.startDocsPreviewRegister.Error)?.error) {
                case "UnauthorizedError":
                case "UnavailableError":
                case "UserNotInOrgError":
                case "InvalidDomainError":
                    return {
                        ok: false,
                        error: _response.error.body as FernRegistry.docs.v2.write.startDocsPreviewRegister.Error,
                    };
            }
        }

        return {
            ok: false,
            error: FernRegistry.docs.v2.write.startDocsPreviewRegister.Error._unknown(_response.error),
        };
    }

    /**
     * @param {FernRegistry.docs.v1.write.DocsRegistrationId} docsRegistrationId
     * @param {FernRegistry.docs.v2.write.RegisterDocsRequest} request
     * @param {Write.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.docs.v2.write.finishDocsRegister(FernRegistry.docs.v1.write.DocsRegistrationId("docsRegistrationId"), {
     *         docsDefinition: {
     *             pages: {
     *                 "pages": {
     *                     markdown: "markdown",
     *                     editThisPageUrl: undefined
     *                 }
     *             },
     *             config: {
     *                 title: undefined,
     *                 defaultLanguage: undefined,
     *                 announcement: undefined,
     *                 navigation: undefined,
     *                 root: undefined,
     *                 navbarLinks: undefined,
     *                 footerLinks: undefined,
     *                 hideNavLinks: undefined,
     *                 logoHeight: undefined,
     *                 logoHref: undefined,
     *                 favicon: undefined,
     *                 metadata: undefined,
     *                 redirects: undefined,
     *                 colorsV3: undefined,
     *                 layout: undefined,
     *                 typographyV2: undefined,
     *                 analyticsConfig: undefined,
     *                 integrations: undefined,
     *                 css: undefined,
     *                 js: undefined,
     *                 aiChatConfig: undefined,
     *                 backgroundImage: undefined,
     *                 logoV2: undefined,
     *                 logo: undefined,
     *                 colors: undefined,
     *                 colorsV2: undefined,
     *                 typography: undefined
     *             },
     *             jsFiles: undefined
     *         }
     *     })
     */
    public async finishDocsRegister(
        docsRegistrationId: FernRegistry.docs.v1.write.DocsRegistrationId,
        request: FernRegistry.docs.v2.write.RegisterDocsRequest,
        requestOptions?: Write.RequestOptions
    ): Promise<core.APIResponse<void, FernRegistry.docs.v2.write.finishDocsRegister.Error>> {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernRegistryEnvironment.Prod,
                `/v2/registry/docs/register/${encodeURIComponent(docsRegistrationId)}`
            ),
            method: "POST",
            headers: {
                Authorization: await this._getAuthorizationHeader(),
                "X-Fern-Language": "JavaScript",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            requestType: "json",
            body: request,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : undefined,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return {
                ok: true,
                body: undefined,
            };
        }

        if (_response.error.reason === "status-code") {
            switch ((_response.error.body as FernRegistry.docs.v2.write.finishDocsRegister.Error)?.error) {
                case "UnauthorizedError":
                case "UserNotInOrgError":
                case "DocsRegistrationIdNotFound":
                    return {
                        ok: false,
                        error: _response.error.body as FernRegistry.docs.v2.write.finishDocsRegister.Error,
                    };
            }
        }

        return {
            ok: false,
            error: FernRegistry.docs.v2.write.finishDocsRegister.Error._unknown(_response.error),
        };
    }

    /**
     * @param {FernRegistry.docs.v2.write.ReindexAlgoliaRecordsRequest} request
     * @param {Write.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.docs.v2.write.reindexAlgoliaSearchRecords({
     *         url: FernRegistry.Url("url")
     *     })
     */
    public async reindexAlgoliaSearchRecords(
        request: FernRegistry.docs.v2.write.ReindexAlgoliaRecordsRequest,
        requestOptions?: Write.RequestOptions
    ): Promise<core.APIResponse<void, FernRegistry.docs.v2.write.reindexAlgoliaSearchRecords.Error>> {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernRegistryEnvironment.Prod,
                "/v2/registry/docs/algolia/reindex"
            ),
            method: "POST",
            headers: {
                Authorization: await this._getAuthorizationHeader(),
                "X-Fern-Language": "JavaScript",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            requestType: "json",
            body: request,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : undefined,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return {
                ok: true,
                body: undefined,
            };
        }

        if (_response.error.reason === "status-code") {
            switch ((_response.error.body as FernRegistry.docs.v2.write.reindexAlgoliaSearchRecords.Error)?.error) {
                case "DocsNotFoundError":
                case "ReindexNotAllowedError":
                    return {
                        ok: false,
                        error: _response.error.body as FernRegistry.docs.v2.write.reindexAlgoliaSearchRecords.Error,
                    };
            }
        }

        return {
            ok: false,
            error: FernRegistry.docs.v2.write.reindexAlgoliaSearchRecords.Error._unknown(_response.error),
        };
    }

    /**
     * @param {FernRegistry.docs.v2.write.TransferDomainOwnershipRequest} request
     * @param {Write.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.docs.v2.write.transferOwnershipOfDomain({
     *         domain: "domain",
     *         toOrgId: "toOrgId"
     *     })
     */
    public async transferOwnershipOfDomain(
        request: FernRegistry.docs.v2.write.TransferDomainOwnershipRequest,
        requestOptions?: Write.RequestOptions
    ): Promise<core.APIResponse<void, FernRegistry.docs.v2.write.transferOwnershipOfDomain.Error>> {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernRegistryEnvironment.Prod,
                "/v2/registry/docs/transfer-ownership"
            ),
            method: "POST",
            headers: {
                Authorization: await this._getAuthorizationHeader(),
                "X-Fern-Language": "JavaScript",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            requestType: "json",
            body: request,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : undefined,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return {
                ok: true,
                body: undefined,
            };
        }

        if (_response.error.reason === "status-code") {
            switch ((_response.error.body as FernRegistry.docs.v2.write.transferOwnershipOfDomain.Error)?.error) {
                case "DocsNotFoundError":
                case "UnauthorizedError":
                    return {
                        ok: false,
                        error: _response.error.body as FernRegistry.docs.v2.write.transferOwnershipOfDomain.Error,
                    };
            }
        }

        return {
            ok: false,
            error: FernRegistry.docs.v2.write.transferOwnershipOfDomain.Error._unknown(_response.error),
        };
    }

    protected async _getAuthorizationHeader(): Promise<string | undefined> {
        const bearer = await core.Supplier.get(this._options.token);
        if (bearer != null) {
            return `Bearer ${bearer}`;
        }

        return undefined;
    }
}
