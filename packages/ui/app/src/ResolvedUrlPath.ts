import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { MDXRemoteSerializeResult } from "next-mdx-remote";

export type ResolvedUrlPath =
    | ResolvedUrlPath.Section
    | ResolvedUrlPath.MdxPage
    | ResolvedUrlPath.Api
    | ResolvedUrlPath.ClientLibraries
    | ResolvedUrlPath.TopLevelEndpoint
    | ResolvedUrlPath.TopLevelWebhook
    | ResolvedUrlPath.ApiSubpackage
    | ResolvedUrlPath.Endpoint
    | ResolvedUrlPath.Webhook;

export declare namespace ResolvedUrlPath {
    export interface Section {
        type: "section";
        section: FernRegistryDocsRead.DocsSection;
        slug: string;
    }

    export interface MdxPage {
        type: "mdx-page";
        page: FernRegistryDocsRead.PageMetadata;
        slug: string;
        serializedMdxContent: MDXRemoteSerializeResult;
    }

    export interface Api {
        type: "api";
        apiSection: FernRegistryDocsRead.ApiSection;
        apiSlug: string;
        slug: string;
    }

    export interface ClientLibraries {
        type: "clientLibraries";
        apiSection: FernRegistryDocsRead.ApiSection;
        apiSlug: string;
        slug: string;
        artifacts: FernRegistryDocsRead.ApiArtifacts;
    }

    export interface TopLevelEndpoint {
        type: "topLevelEndpoint";
        apiSection: FernRegistryDocsRead.ApiSection;
        apiSlug: string;
        slug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }

    export interface TopLevelWebhook {
        type: "topLevelWebhook";
        apiSection: FernRegistryDocsRead.ApiSection;
        apiSlug: string;
        slug: string;
        webhook: FernRegistryApiRead.WebhookDefinition;
    }

    export interface ApiSubpackage {
        type: "apiSubpackage";
        apiSection: FernRegistryDocsRead.ApiSection;
        apiSlug: string;
        slug: string;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
    }

    export interface Endpoint {
        type: "endpoint";
        apiSection: FernRegistryDocsRead.ApiSection;
        apiSlug: string;
        slug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
        parent: FernRegistryApiRead.ApiDefinitionSubpackage;
    }

    export interface Webhook {
        type: "webhook";
        apiSection: FernRegistryDocsRead.ApiSection;
        apiSlug: string;
        slug: string;
        webhook: FernRegistryApiRead.WebhookDefinition;
        parent: FernRegistryApiRead.ApiDefinitionSubpackage;
    }
}
