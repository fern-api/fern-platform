/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as environments from "../../../../../../../../environments";
import * as core from "../../../../../../../../core";
import * as FernRegistry from "../../../../../../../index";
import urlJoin from "url-join";

export declare namespace Read {
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

export class Read {
    constructor(protected readonly _options: Read.Options = {}) {}

    /**
     * @param {FernRegistry.docs.v2.read.GetOrganizationForUrlRequest} request
     * @param {Read.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.docs.v2.read.getOrganizationForUrl({
     *         url: FernRegistry.Url("url")
     *     })
     */
    public async getOrganizationForUrl(
        request: FernRegistry.docs.v2.read.GetOrganizationForUrlRequest,
        requestOptions?: Read.RequestOptions
    ): Promise<core.APIResponse<FernRegistry.OrgId, FernRegistry.docs.v2.read.getOrganizationForUrl.Error>> {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernRegistryEnvironment.Prod,
                "/v2/registry/docs/organization-for-url"
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
                body: _response.body as FernRegistry.OrgId,
            };
        }

        if (_response.error.reason === "status-code") {
            switch ((_response.error.body as FernRegistry.docs.v2.read.getOrganizationForUrl.Error)?.error) {
                case "DomainNotRegisteredError":
                    return {
                        ok: false,
                        error: _response.error.body as FernRegistry.docs.v2.read.getOrganizationForUrl.Error,
                    };
            }
        }

        return {
            ok: false,
            error: FernRegistry.docs.v2.read.getOrganizationForUrl.Error._unknown(_response.error),
        };
    }

    /**
     * @param {FernRegistry.docs.v2.read.GetMetadataForUrlRequest} request
     * @param {Read.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.docs.v2.read.getDocsUrlMetadata({
     *         url: FernRegistry.Url("url")
     *     })
     */
    public async getDocsUrlMetadata(
        request: FernRegistry.docs.v2.read.GetMetadataForUrlRequest,
        requestOptions?: Read.RequestOptions
    ): Promise<
        core.APIResponse<FernRegistry.docs.v2.read.DocsUrlMetadata, FernRegistry.docs.v2.read.getDocsUrlMetadata.Error>
    > {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernRegistryEnvironment.Prod,
                "/v2/registry/docs/metadata-for-url"
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
                body: _response.body as FernRegistry.docs.v2.read.DocsUrlMetadata,
            };
        }

        if (_response.error.reason === "status-code") {
            switch ((_response.error.body as FernRegistry.docs.v2.read.getDocsUrlMetadata.Error)?.error) {
                case "DomainNotRegisteredError":
                    return {
                        ok: false,
                        error: _response.error.body as FernRegistry.docs.v2.read.getDocsUrlMetadata.Error,
                    };
            }
        }

        return {
            ok: false,
            error: FernRegistry.docs.v2.read.getDocsUrlMetadata.Error._unknown(_response.error),
        };
    }

    /**
     * @param {FernRegistry.docs.v2.read.LoadDocsForUrlRequest} request
     * @param {Read.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.docs.v2.read.getDocsForUrl({
     *         url: FernRegistry.Url("url")
     *     })
     */
    public async getDocsForUrl(
        request: FernRegistry.docs.v2.read.LoadDocsForUrlRequest,
        requestOptions?: Read.RequestOptions
    ): Promise<
        core.APIResponse<
            FernRegistry.docs.v2.read.LoadDocsForUrlResponse,
            FernRegistry.docs.v2.read.getDocsForUrl.Error
        >
    > {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernRegistryEnvironment.Prod,
                "/v2/registry/docs/load-with-url"
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
                body: _response.body as FernRegistry.docs.v2.read.LoadDocsForUrlResponse,
            };
        }

        if (_response.error.reason === "status-code") {
            switch ((_response.error.body as FernRegistry.docs.v2.read.getDocsForUrl.Error)?.error) {
                case "DomainNotRegisteredError":
                case "UnauthorizedError":
                    return {
                        ok: false,
                        error: _response.error.body as FernRegistry.docs.v2.read.getDocsForUrl.Error,
                    };
            }
        }

        return {
            ok: false,
            error: FernRegistry.docs.v2.read.getDocsForUrl.Error._unknown(_response.error),
        };
    }

    /**
     * @param {FernRegistry.docs.v2.read.LoadPrivateDocsForUrlRequest} request
     * @param {Read.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.docs.v2.read.getPrivateDocsForUrl({
     *         url: FernRegistry.Url("url")
     *     })
     */
    public async getPrivateDocsForUrl(
        request: FernRegistry.docs.v2.read.LoadPrivateDocsForUrlRequest,
        requestOptions?: Read.RequestOptions
    ): Promise<
        core.APIResponse<
            FernRegistry.docs.v2.read.LoadDocsForUrlResponse,
            FernRegistry.docs.v2.read.getPrivateDocsForUrl.Error
        >
    > {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernRegistryEnvironment.Prod,
                "/v2/registry/docs/private/load-with-url"
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
                body: _response.body as FernRegistry.docs.v2.read.LoadDocsForUrlResponse,
            };
        }

        if (_response.error.reason === "status-code") {
            switch ((_response.error.body as FernRegistry.docs.v2.read.getPrivateDocsForUrl.Error)?.error) {
                case "DomainNotRegisteredError":
                case "UnauthorizedError":
                    return {
                        ok: false,
                        error: _response.error.body as FernRegistry.docs.v2.read.getPrivateDocsForUrl.Error,
                    };
            }
        }

        return {
            ok: false,
            error: FernRegistry.docs.v2.read.getPrivateDocsForUrl.Error._unknown(_response.error),
        };
    }

    /**
     * Returns a list of all public docs.
     *
     * @param {FernRegistry.docs.v2.read.ListAllDocsUrlsRequest} request
     * @param {Read.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.docs.v2.read.listAllDocsUrls()
     */
    public async listAllDocsUrls(
        request: FernRegistry.docs.v2.read.ListAllDocsUrlsRequest = {},
        requestOptions?: Read.RequestOptions
    ): Promise<
        core.APIResponse<
            FernRegistry.docs.v2.read.ListAllDocsUrlsResponse,
            FernRegistry.docs.v2.read.listAllDocsUrls.Error
        >
    > {
        const { page, limit, custom } = request;
        const _queryParams: Record<string, string | string[] | object | object[]> = {};
        if (page != null) {
            _queryParams["page"] = page.toString();
        }

        if (limit != null) {
            _queryParams["limit"] = limit.toString();
        }

        if (custom != null) {
            _queryParams["custom"] = custom.toString();
        }

        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernRegistryEnvironment.Prod,
                "/v2/registry/docs/urls/list"
            ),
            method: "GET",
            headers: {
                Authorization: await this._getAuthorizationHeader(),
                "X-Fern-Language": "JavaScript",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            queryParameters: _queryParams,
            requestType: "json",
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : undefined,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return {
                ok: true,
                body: _response.body as FernRegistry.docs.v2.read.ListAllDocsUrlsResponse,
            };
        }

        if (_response.error.reason === "status-code") {
            switch ((_response.error.body as FernRegistry.docs.v2.read.listAllDocsUrls.Error)?.error) {
                case "UnauthorizedError":
                    return {
                        ok: false,
                        error: _response.error.body as FernRegistry.docs.v2.read.listAllDocsUrls.Error,
                    };
            }
        }

        return {
            ok: false,
            error: FernRegistry.docs.v2.read.listAllDocsUrls.Error._unknown(_response.error),
        };
    }

    /**
     * Loads the Docs Config and any referenced APIs by ID.
     *
     * @param {FernRegistry.DocsConfigId} docsConfigId
     * @param {Read.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.docs.v2.read.getDocsConfigById(FernRegistry.DocsConfigId("docsConfigId"))
     */
    public async getDocsConfigById(
        docsConfigId: FernRegistry.DocsConfigId,
        requestOptions?: Read.RequestOptions
    ): Promise<
        core.APIResponse<
            FernRegistry.docs.v2.read.GetDocsConfigByIdResponse,
            FernRegistry.docs.v2.read.getDocsConfigById.Error
        >
    > {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernRegistryEnvironment.Prod,
                `/v2/registry/docs/${encodeURIComponent(docsConfigId)}`
            ),
            method: "GET",
            headers: {
                Authorization: await this._getAuthorizationHeader(),
                "X-Fern-Language": "JavaScript",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            requestType: "json",
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : undefined,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return {
                ok: true,
                body: _response.body as FernRegistry.docs.v2.read.GetDocsConfigByIdResponse,
            };
        }

        if (_response.error.reason === "status-code") {
            switch ((_response.error.body as FernRegistry.docs.v2.read.getDocsConfigById.Error)?.error) {
                case "DocsDefinitionNotFoundError":
                    return {
                        ok: false,
                        error: _response.error.body as FernRegistry.docs.v2.read.getDocsConfigById.Error,
                    };
            }
        }

        return {
            ok: false,
            error: FernRegistry.docs.v2.read.getDocsConfigById.Error._unknown(_response.error),
        };
    }

    /**
     * @param {FernRegistry.docs.v2.read.GetSearchApiKeyForIndexSegmentRequest} request
     * @param {Read.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.docs.v2.read.getSearchApiKeyForIndexSegment({
     *         indexSegmentId: "indexSegmentId"
     *     })
     */
    public async getSearchApiKeyForIndexSegment(
        request: FernRegistry.docs.v2.read.GetSearchApiKeyForIndexSegmentRequest,
        requestOptions?: Read.RequestOptions
    ): Promise<
        core.APIResponse<
            FernRegistry.docs.v2.read.GetSearchApiKeyForIndexSegmentResponse,
            FernRegistry.docs.v2.read.getSearchApiKeyForIndexSegment.Error
        >
    > {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernRegistryEnvironment.Prod,
                "/v2/registry/docs/search-api-key-with-index-segment"
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
                body: _response.body as FernRegistry.docs.v2.read.GetSearchApiKeyForIndexSegmentResponse,
            };
        }

        if (_response.error.reason === "status-code") {
            switch ((_response.error.body as FernRegistry.docs.v2.read.getSearchApiKeyForIndexSegment.Error)?.error) {
                case "IndexSegmentNotFoundError":
                    return {
                        ok: false,
                        error: _response.error.body as FernRegistry.docs.v2.read.getSearchApiKeyForIndexSegment.Error,
                    };
            }
        }

        return {
            ok: false,
            error: FernRegistry.docs.v2.read.getSearchApiKeyForIndexSegment.Error._unknown(_response.error),
        };
    }

    /**
     * Prepopulates the FDR read S3 bucket with docs definitions
     *
     * @param {Read.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.docs.v2.read.prepopulateFdrReadS3Bucket()
     */
    public async prepopulateFdrReadS3Bucket(
        requestOptions?: Read.RequestOptions
    ): Promise<core.APIResponse<void, FernRegistry.docs.v2.read.prepopulateFdrReadS3Bucket.Error>> {
        const _response = await core.fetcher({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.FernRegistryEnvironment.Prod,
                "/v2/registry/docs/prepopulate-s3-bucket"
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

        return {
            ok: false,
            error: FernRegistry.docs.v2.read.prepopulateFdrReadS3Bucket.Error._unknown(_response.error),
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
