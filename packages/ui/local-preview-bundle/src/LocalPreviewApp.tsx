import * as FernRegistryDocsRead from "@fern-api/fdr-sdk/dist/generated/api/resources/docs/resources/v2/resources/read";
import { App } from "@fern-ui/ui";
import { FC } from "react";

const DEV_DOCS = {
    docs: {
        baseUrl: {
            domain: "fern.docs.buildwithfern.com",
        },
        definition: {
            algoliaSearchIndex: "fern.docs.buildwithfern.com_0d4ff95a-fb0b-48da-918f-b85bd3f6dba7",
            config: {
                navigation: {
                    tabs: [
                        {
                            title: "Overview",
                            icon: "fa-solid fa-globe",
                            items: [
                                {
                                    type: "section" as const,
                                    title: "Welcome",
                                    urlSlug: "welcome",
                                    collapsed: false,
                                    items: [
                                        {
                                            type: "page" as const,
                                            id: "pages/welcome/introduction.mdx",
                                            title: "Introduction",
                                            urlSlug: "introduction",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/welcome/quickstart.mdx",
                                            title: "Quickstart",
                                            urlSlug: "quickstart",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/welcome/why-fern.mdx",
                                            title: "Why Fern?",
                                            urlSlug: "why-fern",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/welcome/generators.mdx",
                                            title: "Generators",
                                            urlSlug: "generators",
                                        },
                                    ],
                                    skipUrlSlug: false,
                                },
                                {
                                    type: "section" as const,
                                    title: "CLI",
                                    urlSlug: "cli",
                                    collapsed: false,
                                    items: [
                                        {
                                            type: "page" as const,
                                            id: "pages/cli/overview.mdx",
                                            title: "Overview",
                                            urlSlug: "cli",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/cli/fern-generate.mdx",
                                            title: "fern generate",
                                            urlSlug: "fern-generate",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/cli/fern-check.mdx",
                                            title: "fern check",
                                            urlSlug: "fern-check",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/cli/fern-add.mdx",
                                            title: "fern add",
                                            urlSlug: "fern-add",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/cli/fern-init.mdx",
                                            title: "fern init",
                                            urlSlug: "fern-init",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/cli/fern-write-definition.mdx",
                                            title: "fern write definition",
                                            urlSlug: "fern-write-definition",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/cli/fern-upgrade.mdx",
                                            title: "fern upgrade",
                                            urlSlug: "fern-upgrade",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/cli/fern-login.mdx",
                                            title: "fern login",
                                            urlSlug: "fern-login",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/cli/fern-register.mdx",
                                            title: "fern register",
                                            urlSlug: "fern-register",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/cli/fern-format.mdx",
                                            title: "fern format",
                                            urlSlug: "fern-format",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/cli/fern-help.mdx",
                                            title: "fern help",
                                            urlSlug: "fern-help",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/cli/fern-version.mdx",
                                            title: "fern version",
                                            urlSlug: "fern-version",
                                        },
                                    ],
                                    skipUrlSlug: false,
                                },
                                {
                                    type: "section" as const,
                                    title: "Guides",
                                    urlSlug: "guides",
                                    collapsed: false,
                                    items: [
                                        {
                                            type: "page" as const,
                                            id: "pages/guides/publish-to-maven-central.mdx",
                                            title: "Publishing to Maven Central",
                                            urlSlug: "publishing-to-maven-central",
                                        },
                                    ],
                                    skipUrlSlug: false,
                                },
                            ],
                            urlSlug: "overview",
                        },
                        {
                            title: "API Definition",
                            icon: "fa-solid fa-pen-to-square",
                            items: [
                                {
                                    type: "section" as const,
                                    title: "OpenAPI Specification",
                                    urlSlug: "open-api-specification",
                                    collapsed: false,
                                    items: [
                                        {
                                            type: "page" as const,
                                            id: "pages/openapi/import.mdx",
                                            title: "Importing OpenAPI",
                                            urlSlug: "openapi/import",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/openapi/extensions.mdx",
                                            title: "OpenAPI Extensions",
                                            urlSlug: "openapi/extensions",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/openapi/export.mdx",
                                            title: "Exporting OpenAPI",
                                            urlSlug: "openapi/export",
                                        },
                                    ],
                                    skipUrlSlug: false,
                                },
                                {
                                    type: "section" as const,
                                    title: "Fern Definition",
                                    urlSlug: "fern-definition",
                                    collapsed: false,
                                    items: [
                                        {
                                            type: "page" as const,
                                            id: "pages/fern-definition/definition.mdx",
                                            title: "Overview",
                                            urlSlug: "fern-definition",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/fern-definition/types.mdx",
                                            title: "Types",
                                            urlSlug: "fern-definition/types",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/fern-definition/endpoints.mdx",
                                            title: "Endpoints",
                                            urlSlug: "fern-definition/endpoints",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/fern-definition/errors.mdx",
                                            title: "Errors",
                                            urlSlug: "fern-definition/errors",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/fern-definition/imports.mdx",
                                            title: "Imports",
                                            urlSlug: "fern-definition/imports",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/fern-definition/api-yml.mdx",
                                            title: "api.yml reference",
                                            urlSlug: "fern-definition/api-yml-reference",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/fern-definition/packages.mdx",
                                            title: "Packages",
                                            urlSlug: "fern-definition/packages",
                                        },
                                    ],
                                    skipUrlSlug: false,
                                },
                            ],
                            urlSlug: "api-definition",
                        },
                        {
                            title: "SDKs",
                            icon: "fa-solid fa-code",
                            items: [
                                {
                                    type: "section" as const,
                                    title: "Generators",
                                    urlSlug: "generators",
                                    collapsed: false,
                                    items: [
                                        {
                                            type: "page" as const,
                                            id: "pages/sdks/node-sdk.mdx",
                                            title: "TypeScript Node.js SDK",
                                            urlSlug: "sdk/typescript-node",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/sdks/browser-sdk.mdx",
                                            title: "TypeScript Browser SDK",
                                            urlSlug: "sdk/typescript-browser",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/sdks/python-sdk.mdx",
                                            title: "Python SDK",
                                            urlSlug: "sdk/python",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/sdks/java-sdk.mdx",
                                            title: "Java SDK",
                                            urlSlug: "sdk/java",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/sdks/go-sdk.mdx",
                                            title: "Go SDK",
                                            urlSlug: "sdk/go",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/sdks/ruby-sdk.mdx",
                                            title: "Ruby SDK",
                                            urlSlug: "sdk/ruby",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/sdks/csharp-sdk.mdx",
                                            title: "C# SDK",
                                            urlSlug: "sdk/csharp",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/sdks/php-sdk.mdx",
                                            title: "PHP SDK",
                                            urlSlug: "sdk/php",
                                        },
                                    ],
                                    skipUrlSlug: false,
                                },
                            ],
                            urlSlug: "sd-ks",
                        },
                        {
                            title: "Docs",
                            icon: "fa-solid fa-book",
                            items: [
                                {
                                    type: "section" as const,
                                    title: "Overview",
                                    urlSlug: "overview",
                                    collapsed: false,
                                    items: [
                                        {
                                            type: "page" as const,
                                            id: "pages/docs/configuration.mdx",
                                            title: "Configuration",
                                            urlSlug: "docs/configuration",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/docs/custom-domain.mdx",
                                            title: "Custom domain",
                                            urlSlug: "docs/custom-domain",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/docs/previews.mdx",
                                            title: "Pull request previews",
                                            urlSlug: "docs/previews",
                                        },
                                    ],
                                    skipUrlSlug: false,
                                },
                                {
                                    type: "section" as const,
                                    title: "Component Library",
                                    urlSlug: "component-library",
                                    collapsed: false,
                                    items: [
                                        {
                                            type: "page" as const,
                                            id: "pages/docs/components/card.mdx",
                                            title: "Cards",
                                            urlSlug: "cards",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/docs/components/callout.mdx",
                                            title: "Callout",
                                            urlSlug: "callout",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/docs/components/icons.mdx",
                                            title: "Icons",
                                            urlSlug: "icons",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/docs/components/availability.mdx",
                                            title: "Availability",
                                            urlSlug: "availability",
                                        },
                                    ],
                                    skipUrlSlug: false,
                                },
                            ],
                            urlSlug: "docs",
                        },
                        {
                            title: "Server boilerplate",
                            icon: "fa-solid fa-server",
                            items: [
                                {
                                    type: "section" as const,
                                    title: "Server boilerplate",
                                    urlSlug: "server-boilerplate",
                                    collapsed: false,
                                    items: [
                                        {
                                            type: "page" as const,
                                            id: "pages/server-boilerplate/express.mdx",
                                            title: "Express.js",
                                            urlSlug: "express-js",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/server-boilerplate/fastapi.mdx",
                                            title: "FastAPI",
                                            urlSlug: "fast-api",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/server-boilerplate/spring.mdx",
                                            title: "Spring",
                                            urlSlug: "spring",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/server-boilerplate/go.mdx",
                                            title: "Go",
                                            urlSlug: "go",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/server-boilerplate/ruby-on-rails.mdx",
                                            title: "Ruby on Rails",
                                            urlSlug: "ruby-on-rails",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/server-boilerplate/flask.mdx",
                                            title: "Flask",
                                            urlSlug: "flask",
                                        },
                                        {
                                            type: "page" as const,
                                            id: "pages/server-boilerplate/django.mdx",
                                            title: "Django",
                                            urlSlug: "django",
                                        },
                                    ],
                                    skipUrlSlug: false,
                                },
                            ],
                            urlSlug: "server-boilerplate",
                        },
                        {
                            title: "API Reference",
                            icon: "fa-solid fa-file-contract",
                            items: [
                                {
                                    type: "section" as const,
                                    title: "Overview",
                                    urlSlug: "overview",
                                    collapsed: false,
                                    items: [
                                        {
                                            type: "page" as const,
                                            id: "pages/api/intro.mdx",
                                            title: "Introduction",
                                            urlSlug: "introduction",
                                        },
                                    ],
                                    skipUrlSlug: false,
                                },
                                {
                                    type: "api" as const,
                                    title: "Reference",
                                    api: "32278134-5dc7-434f-a478-7b3b5615d481",
                                    showErrors: false,
                                    urlSlug: "reference",
                                    skipUrlSlug: false,
                                },
                            ],
                            urlSlug: "api-reference",
                        },
                    ],
                },
                logoV2: {
                    dark: "c4997a9a-c3b3-4b2a-9adf-b82367736974",
                    light: null,
                },
                logoHeight: 30,
                logoHref: "https://www.buildwithfern.com",
                colorsV2: {
                    accentPrimary: {
                        type: "unthemed" as const,
                        color: {
                            r: 22,
                            g: 238,
                            b: 157,
                        },
                    },
                    background: null,
                },
                colorsV3: {
                    type: "dark" as const,
                    accentPrimary: {
                        r: 22,
                        g: 238,
                        b: 157,
                    },
                    background: {
                        type: "gradient" as const,
                    },
                    logo: "c4997a9a-c3b3-4b2a-9adf-b82367736974",
                },
                navbarLinks: [
                    {
                        type: "secondary" as const,
                        text: "Home",
                        url: "https://buildwithfern.com",
                    },
                    {
                        type: "secondary" as const,
                        text: "Showcase",
                        url: "https://buildwithfern.com/showcase",
                    },
                    {
                        type: "primary" as const,
                        text: "GitHub",
                        url: "https://github.com/fern-api/fern",
                    },
                ],
                title: "Fern | Documentation",
                favicon: "a54cdbaf-8fc1-4270-8a25-e8807923b767",
                backgroundImage: "9f6a8afe-fab3-430c-ad15-c7e1a46c9904",
                typography: null,
            },
            apis: {
                "32278134-5dc7-434f-a478-7b3b5615d481": {
                    id: "32278134-5dc7-434f-a478-7b3b5615d481",
                    rootPackage: {
                        endpoints: [],
                        subpackages: ["subpackage_snippets"],
                        types: [],
                        webhooks: [],
                    },
                    types: {
                        "type_snippets:EndpointIdentifier": {
                            description: null,
                            name: "EndpointIdentifier",
                            shape: {
                                type: "object" as const,
                                extends: [],
                                properties: [
                                    {
                                        description: null,
                                        key: "path",
                                        valueType: {
                                            type: "id" as const,
                                            value: "type_snippets:EndpointPath",
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                    {
                                        description: null,
                                        key: "method",
                                        valueType: {
                                            type: "id" as const,
                                            value: "type_snippets:EndpointMethod",
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                ],
                            },
                            descriptionContainsMarkdown: false,
                        },
                        "type_snippets:EndpointPath": {
                            description: "The relative path for an endpont (e.g. `/users/{userId}`)",
                            htmlDescription:
                                "<p>The relative path for an endpont (e.g. <code>/users/{userId}</code>)</p>\n",
                            name: "EndpointPath",
                            shape: {
                                type: "alias" as const,
                                value: {
                                    type: "primitive" as const,
                                    value: {
                                        type: "string" as const,
                                    },
                                },
                            },
                            descriptionContainsMarkdown: true,
                        },
                        "type_snippets:EndpointMethod": {
                            description: null,
                            name: "EndpointMethod",
                            shape: {
                                type: "enum" as const,
                                values: [
                                    {
                                        description: null,
                                        value: "PUT",
                                        descriptionContainsMarkdown: false,
                                    },
                                    {
                                        description: null,
                                        value: "POST",
                                        descriptionContainsMarkdown: false,
                                    },
                                    {
                                        description: null,
                                        value: "GET",
                                        descriptionContainsMarkdown: false,
                                    },
                                    {
                                        description: null,
                                        value: "PATCH",
                                        descriptionContainsMarkdown: false,
                                    },
                                    {
                                        description: null,
                                        value: "DELETE",
                                        descriptionContainsMarkdown: false,
                                    },
                                ],
                            },
                            descriptionContainsMarkdown: false,
                        },
                        "type_snippets:SDK": {
                            description: null,
                            name: "SDK",
                            shape: {
                                type: "discriminatedUnion" as const,
                                discriminant: "type",
                                variants: [
                                    {
                                        description: null,
                                        descriptionContainsMarkdown: false,
                                        discriminantValue: "typescript",
                                        additionalProperties: {
                                            extends: ["type_snippets:TypeScriptSDK"],
                                            properties: [],
                                        },
                                    },
                                    {
                                        description: null,
                                        descriptionContainsMarkdown: false,
                                        discriminantValue: "python",
                                        additionalProperties: {
                                            extends: ["type_snippets:PythonSDK"],
                                            properties: [],
                                        },
                                    },
                                    {
                                        description: null,
                                        descriptionContainsMarkdown: false,
                                        discriminantValue: "go",
                                        additionalProperties: {
                                            extends: ["type_snippets:GoSDK"],
                                            properties: [],
                                        },
                                    },
                                    {
                                        description: null,
                                        descriptionContainsMarkdown: false,
                                        discriminantValue: "java",
                                        additionalProperties: {
                                            extends: ["type_snippets:JavaSDK"],
                                            properties: [],
                                        },
                                    },
                                ],
                            },
                            descriptionContainsMarkdown: false,
                        },
                        "type_snippets:TypeScriptSDK": {
                            description: null,
                            name: "TypeScriptSDK",
                            shape: {
                                type: "object" as const,
                                extends: [],
                                properties: [
                                    {
                                        description: null,
                                        key: "package",
                                        valueType: {
                                            type: "primitive" as const,
                                            value: {
                                                type: "string" as const,
                                            },
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                    {
                                        description: null,
                                        key: "version",
                                        valueType: {
                                            type: "primitive" as const,
                                            value: {
                                                type: "string" as const,
                                            },
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                ],
                            },
                            descriptionContainsMarkdown: false,
                        },
                        "type_snippets:PythonSDK": {
                            description: null,
                            name: "PythonSDK",
                            shape: {
                                type: "object" as const,
                                extends: [],
                                properties: [
                                    {
                                        description: null,
                                        key: "package",
                                        valueType: {
                                            type: "primitive" as const,
                                            value: {
                                                type: "string" as const,
                                            },
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                    {
                                        description: null,
                                        key: "version",
                                        valueType: {
                                            type: "primitive" as const,
                                            value: {
                                                type: "string" as const,
                                            },
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                ],
                            },
                            descriptionContainsMarkdown: false,
                        },
                        "type_snippets:GoSDK": {
                            description: null,
                            name: "GoSDK",
                            shape: {
                                type: "object" as const,
                                extends: [],
                                properties: [
                                    {
                                        description: null,
                                        key: "githubRepo",
                                        valueType: {
                                            type: "primitive" as const,
                                            value: {
                                                type: "string" as const,
                                            },
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                    {
                                        description: null,
                                        key: "version",
                                        valueType: {
                                            type: "primitive" as const,
                                            value: {
                                                type: "string" as const,
                                            },
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                ],
                            },
                            descriptionContainsMarkdown: false,
                        },
                        "type_snippets:JavaSDK": {
                            description: null,
                            name: "JavaSDK",
                            shape: {
                                type: "object" as const,
                                extends: [],
                                properties: [
                                    {
                                        description: "The maven repository group (e.g. `com.stripe.java`)",
                                        htmlDescription:
                                            "<p>The maven repository group (e.g. <code>com.stripe.java</code>)</p>\n",
                                        key: "group",
                                        valueType: {
                                            type: "primitive" as const,
                                            value: {
                                                type: "string" as const,
                                            },
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                    {
                                        description: "The artifact (e.g. `stripe-java`)",
                                        htmlDescription: "<p>The artifact (e.g. <code>stripe-java</code>)</p>\n",
                                        key: "artifact",
                                        valueType: {
                                            type: "primitive" as const,
                                            value: {
                                                type: "string" as const,
                                            },
                                        },
                                        descriptionContainsMarkdown: true,
                                    },
                                    {
                                        description: null,
                                        key: "version",
                                        valueType: {
                                            type: "primitive" as const,
                                            value: {
                                                type: "string" as const,
                                            },
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                ],
                            },
                            descriptionContainsMarkdown: false,
                        },
                        "type_snippets:SnippetsPage": {
                            description: null,
                            name: "SnippetsPage",
                            shape: {
                                type: "object" as const,
                                extends: [],
                                properties: [
                                    {
                                        description:
                                            "If present, pass this into the `page` query parameter to load the next page.",
                                        htmlDescription:
                                            "<p>If present, pass this into the <code>page</code> query parameter to load the next page.</p>\n",
                                        key: "next",
                                        valueType: {
                                            type: "optional" as const,
                                            itemType: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "integer" as const,
                                                },
                                            },
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                    {
                                        description:
                                            "The snippets are returned as a map of endpoint path (e.g. `/api/users`) \nto a map of endpoint method (e.g. `POST`) to snippets. \n",
                                        htmlDescription:
                                            "<p>The snippets are returned as a map of endpoint path (e.g. <code>/api/users</code>) \nto a map of endpoint method (e.g. <code>POST</code>) to snippets. </p>\n",
                                        key: "snippets",
                                        valueType: {
                                            type: "map" as const,
                                            keyType: {
                                                type: "id" as const,
                                                value: "type_snippets:EndpointPath",
                                            },
                                            valueType: {
                                                type: "id" as const,
                                                value: "type_snippets:SnippetsByEndpointMethod",
                                            },
                                        },
                                        descriptionContainsMarkdown: true,
                                    },
                                ],
                            },
                            descriptionContainsMarkdown: false,
                        },
                        "type_snippets:SnippetsByEndpointMethod": {
                            description: null,
                            name: "SnippetsByEndpointMethod",
                            shape: {
                                type: "alias" as const,
                                value: {
                                    type: "map" as const,
                                    keyType: {
                                        type: "id" as const,
                                        value: "type_snippets:EndpointMethod",
                                    },
                                    valueType: {
                                        type: "list" as const,
                                        itemType: {
                                            type: "id" as const,
                                            value: "type_snippets:Snippet",
                                        },
                                    },
                                },
                            },
                            descriptionContainsMarkdown: false,
                        },
                        "type_snippets:Snippet": {
                            description: null,
                            name: "Snippet",
                            shape: {
                                type: "discriminatedUnion" as const,
                                discriminant: "type",
                                variants: [
                                    {
                                        description: null,
                                        descriptionContainsMarkdown: false,
                                        discriminantValue: "typescript",
                                        additionalProperties: {
                                            extends: ["type_snippets:TypeScriptSnippet"],
                                            properties: [],
                                        },
                                    },
                                    {
                                        description: null,
                                        descriptionContainsMarkdown: false,
                                        discriminantValue: "python",
                                        additionalProperties: {
                                            extends: ["type_snippets:PythonSnippet"],
                                            properties: [],
                                        },
                                    },
                                    {
                                        description: null,
                                        descriptionContainsMarkdown: false,
                                        discriminantValue: "java",
                                        additionalProperties: {
                                            extends: ["type_snippets:JavaSnippet"],
                                            properties: [],
                                        },
                                    },
                                    {
                                        description: null,
                                        descriptionContainsMarkdown: false,
                                        discriminantValue: "go",
                                        additionalProperties: {
                                            extends: ["type_snippets:GoSnippet"],
                                            properties: [],
                                        },
                                    },
                                ],
                            },
                            descriptionContainsMarkdown: false,
                        },
                        "type_snippets:TypeScriptSnippet": {
                            description: null,
                            name: "TypeScriptSnippet",
                            shape: {
                                type: "object" as const,
                                extends: [],
                                properties: [
                                    {
                                        description: null,
                                        key: "sdk",
                                        valueType: {
                                            type: "id" as const,
                                            value: "type_snippets:TypeScriptSDK",
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                    {
                                        description: null,
                                        key: "client",
                                        valueType: {
                                            type: "primitive" as const,
                                            value: {
                                                type: "string" as const,
                                            },
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                ],
                            },
                            descriptionContainsMarkdown: false,
                        },
                        "type_snippets:PythonSnippet": {
                            description: null,
                            name: "PythonSnippet",
                            shape: {
                                type: "object" as const,
                                extends: [],
                                properties: [
                                    {
                                        description: null,
                                        key: "sdk",
                                        valueType: {
                                            type: "id" as const,
                                            value: "type_snippets:PythonSDK",
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                    {
                                        description: null,
                                        key: "async_client",
                                        valueType: {
                                            type: "primitive" as const,
                                            value: {
                                                type: "string" as const,
                                            },
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                    {
                                        description: null,
                                        key: "sync_client",
                                        valueType: {
                                            type: "primitive" as const,
                                            value: {
                                                type: "string" as const,
                                            },
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                ],
                            },
                            descriptionContainsMarkdown: false,
                        },
                        "type_snippets:GoSnippet": {
                            description: null,
                            name: "GoSnippet",
                            shape: {
                                type: "object" as const,
                                extends: [],
                                properties: [
                                    {
                                        description: null,
                                        key: "sdk",
                                        valueType: {
                                            type: "id" as const,
                                            value: "type_snippets:GoSDK",
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                    {
                                        description: null,
                                        key: "client",
                                        valueType: {
                                            type: "primitive" as const,
                                            value: {
                                                type: "string" as const,
                                            },
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                ],
                            },
                            descriptionContainsMarkdown: false,
                        },
                        "type_snippets:JavaSnippet": {
                            description: null,
                            name: "JavaSnippet",
                            shape: {
                                type: "object" as const,
                                extends: [],
                                properties: [
                                    {
                                        description: null,
                                        key: "sdk",
                                        valueType: {
                                            type: "id" as const,
                                            value: "type_snippets:JavaSDK",
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                    {
                                        description: null,
                                        key: "async_client",
                                        valueType: {
                                            type: "primitive" as const,
                                            value: {
                                                type: "string" as const,
                                            },
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                    {
                                        description: null,
                                        key: "sync_client",
                                        valueType: {
                                            type: "primitive" as const,
                                            value: {
                                                type: "string" as const,
                                            },
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                ],
                            },
                            descriptionContainsMarkdown: false,
                        },
                        "type_snippets/commons:OrgId": {
                            description: "Human readable org id (e.g. fern)",
                            htmlDescription: "<p>Human readable org id (e.g. fern)</p>\n",
                            name: "OrgId",
                            shape: {
                                type: "alias" as const,
                                value: {
                                    type: "primitive" as const,
                                    value: {
                                        type: "string" as const,
                                    },
                                },
                            },
                            descriptionContainsMarkdown: false,
                        },
                        "type_snippets/commons:ApiId": {
                            description: "Human readable api identifier (e.g. venus)",
                            htmlDescription: "<p>Human readable api identifier (e.g. venus)</p>\n",
                            name: "ApiId",
                            shape: {
                                type: "alias" as const,
                                value: {
                                    type: "primitive" as const,
                                    value: {
                                        type: "string" as const,
                                    },
                                },
                            },
                            descriptionContainsMarkdown: false,
                        },
                    },
                    subpackages: {
                        subpackage_snippets: {
                            subpackageId: "subpackage_snippets",
                            name: "snippets",
                            endpoints: [
                                {
                                    environments: [
                                        {
                                            id: "Production",
                                            baseUrl: "https://api.buildwithfern.com",
                                        },
                                    ],
                                    availability: "Beta",
                                    defaultEnvironment: "Production",
                                    urlSlug: "get-snippet-for-endpoint",
                                    method: "POST",
                                    id: "get",
                                    name: "Get snippet for endpoint",
                                    path: {
                                        pathParameters: [],
                                        parts: [
                                            {
                                                type: "literal" as const,
                                                value: "/snippets",
                                            },
                                            {
                                                type: "literal" as const,
                                                value: "",
                                            },
                                        ],
                                    },
                                    queryParameters: [],
                                    headers: [],
                                    request: {
                                        contenttype: "application/json" as const,
                                        type: {
                                            type: "object" as const,
                                            extends: [],
                                            properties: [
                                                {
                                                    key: "orgId",
                                                    valueType: {
                                                        type: "optional" as const,
                                                        itemType: {
                                                            type: "id" as const,
                                                            value: "type_snippets/commons:OrgId",
                                                        },
                                                    },
                                                    description:
                                                        "If the same API is defined across multiple organization,\nyou must specify an organization ID.\n",
                                                },
                                                {
                                                    key: "apiId",
                                                    valueType: {
                                                        type: "optional" as const,
                                                        itemType: {
                                                            type: "id" as const,
                                                            value: "type_snippets/commons:ApiId",
                                                        },
                                                    },
                                                    description:
                                                        "If you have more than one API, you must specify its ID.\n",
                                                },
                                                {
                                                    key: "sdks",
                                                    valueType: {
                                                        type: "optional" as const,
                                                        itemType: {
                                                            type: "list" as const,
                                                            itemType: {
                                                                type: "id" as const,
                                                                value: "type_snippets:SDK",
                                                            },
                                                        },
                                                    },
                                                    description:
                                                        "The SDKs for which to load snippets. If unspecified,\nsnippets for the latest published SDKs will be returned.\n",
                                                },
                                                {
                                                    key: "endpoint",
                                                    valueType: {
                                                        type: "id" as const,
                                                        value: "type_snippets:EndpointIdentifier",
                                                    },
                                                    description: null,
                                                },
                                            ],
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                    response: {
                                        type: {
                                            type: "reference" as const,
                                            value: {
                                                type: "list" as const,
                                                itemType: {
                                                    type: "id" as const,
                                                    value: "type_snippets:Snippet",
                                                },
                                            },
                                        },
                                    },
                                    errors: [
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 401,
                                            description: null,
                                        },
                                        {
                                            type: null,
                                            statusCode: 403,
                                            description: null,
                                        },
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 503,
                                            description: null,
                                        },
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 400,
                                            description: "An ApiId is required",
                                        },
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 400,
                                            description: "An OrgId is required",
                                        },
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 400,
                                            description: "The requested OrgId and ApiId was not found",
                                        },
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 404,
                                            description: "The requested OrgId was not found",
                                        },
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 404,
                                            description: "The requested ApId was not found",
                                        },
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 404,
                                            description: "The requested endpoint was not found",
                                        },
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 404,
                                            description: "The requested SDK was not found",
                                        },
                                    ],
                                    errorsV2: [
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "UnauthorizedError",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 401,
                                            name: "Unauthorized Error",
                                            description: null,
                                        },
                                        {
                                            type: null,
                                            statusCode: 403,
                                            name: "User Not In Org Error",
                                            description: null,
                                        },
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "UnavailableError",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 503,
                                            name: "Unavailable Error",
                                            description: null,
                                        },
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "ApiIdRequiredError",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 400,
                                            name: "Api Id Required Error",
                                            description: "An ApiId is required",
                                        },
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "OrgIdRequiredError",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 400,
                                            name: "Org Id Required Error",
                                            description: "An OrgId is required",
                                        },
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "OrgIdAndApiIdNotFound",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 400,
                                            name: "Org Id And Api Id Not Found",
                                            description: "The requested OrgId and ApiId was not found",
                                        },
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "OrgIdNotFound",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 404,
                                            name: "Org Id Not Found",
                                            description: "The requested OrgId was not found",
                                        },
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "ApiIdNotFound",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 404,
                                            name: "Api Id Not Found",
                                            description: "The requested ApId was not found",
                                        },
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "EndpointNotFound",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 404,
                                            name: "Endpoint Not Found",
                                            description: "The requested endpoint was not found",
                                        },
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "SDKNotFound",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 404,
                                            name: "Sdk Not Found",
                                            description: "The requested SDK was not found",
                                        },
                                    ],
                                    examples: [
                                        {
                                            description: null,
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets",
                                            pathParameters: {},
                                            queryParameters: {},
                                            headers: {},
                                            requestBody: {
                                                endpoint: {
                                                    method: "GET",
                                                    path: "/v1/search",
                                                },
                                            },
                                            responseStatusCode: 200,
                                            responseBody: [
                                                {
                                                    type: "python" as const,
                                                    sdk: {
                                                        package: "vellum-ai",
                                                        version: "1.2.1",
                                                    },
                                                    sync_client:
                                                        'import Vellum from vellum.client\n\nclient = Vellum(api_key="YOUR_API_KEY")\nclient.search(query="Find documents written in the last 5 days")\n',
                                                    async_client:
                                                        'import VellumAsync from vellum.client\n\nclient = VellumAsync(api_key="YOUR_API_KEY")\nawait client.search(query="Find documents written in the last 5 days")\n',
                                                },
                                                {
                                                    type: "typescript" as const,
                                                    sdk: {
                                                        package: "vellum-ai",
                                                        version: "1.2.1",
                                                    },
                                                    client: 'import { VellumClient } from "vellum-ai";\n\nconst vellum = VellumClient({\n  apiKey="YOUR_API_KEY"\n})\nvellum.search({\n  query: "Find documents written in the last 5 days"\n})\n',
                                                },
                                            ],
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets",
                                            pathParameters: {},
                                            queryParameters: {},
                                            headers: {},
                                            requestBody: {
                                                endpoint: {
                                                    path: "string",
                                                    method: "PUT",
                                                },
                                            },
                                            responseStatusCode: 401,
                                            responseBody: {
                                                error: "UnauthorizedError",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets",
                                            pathParameters: {},
                                            queryParameters: {},
                                            headers: {},
                                            requestBody: {
                                                endpoint: {
                                                    path: "string",
                                                    method: "PUT",
                                                },
                                            },
                                            responseStatusCode: 403,
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets",
                                            pathParameters: {},
                                            queryParameters: {},
                                            headers: {},
                                            requestBody: {
                                                endpoint: {
                                                    path: "string",
                                                    method: "PUT",
                                                },
                                            },
                                            responseStatusCode: 503,
                                            responseBody: {
                                                error: "UnavailableError",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets",
                                            pathParameters: {},
                                            queryParameters: {},
                                            headers: {},
                                            requestBody: {
                                                endpoint: {
                                                    path: "string",
                                                    method: "PUT",
                                                },
                                            },
                                            responseStatusCode: 400,
                                            responseBody: {
                                                error: "ApiIdRequiredError",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets",
                                            pathParameters: {},
                                            queryParameters: {},
                                            headers: {},
                                            requestBody: {
                                                endpoint: {
                                                    path: "string",
                                                    method: "PUT",
                                                },
                                            },
                                            responseStatusCode: 400,
                                            responseBody: {
                                                error: "OrgIdRequiredError",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets",
                                            pathParameters: {},
                                            queryParameters: {},
                                            headers: {},
                                            requestBody: {
                                                endpoint: {
                                                    path: "string",
                                                    method: "PUT",
                                                },
                                            },
                                            responseStatusCode: 400,
                                            responseBody: {
                                                error: "OrgIdAndApiIdNotFound",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets",
                                            pathParameters: {},
                                            queryParameters: {},
                                            headers: {},
                                            requestBody: {
                                                endpoint: {
                                                    path: "string",
                                                    method: "PUT",
                                                },
                                            },
                                            responseStatusCode: 404,
                                            responseBody: {
                                                error: "OrgIdNotFound",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets",
                                            pathParameters: {},
                                            queryParameters: {},
                                            headers: {},
                                            requestBody: {
                                                endpoint: {
                                                    path: "string",
                                                    method: "PUT",
                                                },
                                            },
                                            responseStatusCode: 404,
                                            responseBody: {
                                                error: "ApiIdNotFound",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets",
                                            pathParameters: {},
                                            queryParameters: {},
                                            headers: {},
                                            requestBody: {
                                                endpoint: {
                                                    path: "string",
                                                    method: "PUT",
                                                },
                                            },
                                            responseStatusCode: 404,
                                            responseBody: {
                                                error: "EndpointNotFound",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets",
                                            pathParameters: {},
                                            queryParameters: {},
                                            headers: {},
                                            requestBody: {
                                                endpoint: {
                                                    path: "string",
                                                    method: "PUT",
                                                },
                                            },
                                            responseStatusCode: 404,
                                            responseBody: {
                                                error: "SDKNotFound",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import EndpointIdentifier, EndpointMethod\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.get(\n    endpoint=EndpointIdentifier(\n        method=EndpointMethod.GET,\n        path="/v1/search",\n    ),\n)\n',
                                                },
                                            },
                                        },
                                    ],
                                    description: "Get snippet by endpoint method and path",
                                    htmlDescription: "<p>Get snippet by endpoint method and path</p>\n",
                                    authed: true,
                                    descriptionContainsMarkdown: false,
                                },
                                {
                                    environments: [
                                        {
                                            id: "Production",
                                            baseUrl: "https://api.buildwithfern.com",
                                        },
                                    ],
                                    availability: "Beta",
                                    defaultEnvironment: "Production",
                                    urlSlug: "load-all-snippets",
                                    method: "POST",
                                    id: "load",
                                    name: "Load all snippets",
                                    path: {
                                        pathParameters: [],
                                        parts: [
                                            {
                                                type: "literal" as const,
                                                value: "/snippets",
                                            },
                                            {
                                                type: "literal" as const,
                                                value: "/load",
                                            },
                                        ],
                                    },
                                    queryParameters: [
                                        {
                                            key: "page",
                                            type: {
                                                type: "optional" as const,
                                                itemType: {
                                                    type: "primitive" as const,
                                                    value: {
                                                        type: "integer" as const,
                                                    },
                                                },
                                            },
                                            description: null,
                                        },
                                    ],
                                    headers: [],
                                    request: {
                                        contenttype: "application/json" as const,
                                        type: {
                                            type: "object" as const,
                                            extends: [],
                                            properties: [
                                                {
                                                    key: "orgId",
                                                    valueType: {
                                                        type: "optional" as const,
                                                        itemType: {
                                                            type: "id" as const,
                                                            value: "type_snippets/commons:OrgId",
                                                        },
                                                    },
                                                    description:
                                                        "If the same API is defined across multiple organization,\nyou must specify an organization ID.\n",
                                                },
                                                {
                                                    key: "apiId",
                                                    valueType: {
                                                        type: "optional" as const,
                                                        itemType: {
                                                            type: "id" as const,
                                                            value: "type_snippets/commons:ApiId",
                                                        },
                                                    },
                                                    description:
                                                        "If you have more than one API, you must specify its ID.\n",
                                                },
                                                {
                                                    key: "sdks",
                                                    valueType: {
                                                        type: "optional" as const,
                                                        itemType: {
                                                            type: "list" as const,
                                                            itemType: {
                                                                type: "id" as const,
                                                                value: "type_snippets:SDK",
                                                            },
                                                        },
                                                    },
                                                    description:
                                                        "The SDKs for which to load snippets. If unspecified,\nsnippets for the latest published SDKs will be returned.\n",
                                                },
                                            ],
                                        },
                                        descriptionContainsMarkdown: false,
                                    },
                                    response: {
                                        type: {
                                            type: "reference" as const,
                                            value: {
                                                type: "id" as const,
                                                value: "type_snippets:SnippetsPage",
                                            },
                                        },
                                    },
                                    errors: [
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 401,
                                            description: null,
                                        },
                                        {
                                            type: null,
                                            statusCode: 403,
                                            description: null,
                                        },
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 503,
                                            description: null,
                                        },
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 400,
                                            description: "Page must be >=1",
                                        },
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 400,
                                            description: "An ApiId is required",
                                        },
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 400,
                                            description: "An OrgId is required",
                                        },
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 400,
                                            description: "The requested OrgId and ApiId was not found",
                                        },
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 404,
                                            description: "The requested OrgId was not found",
                                        },
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 404,
                                            description: "The requested ApId was not found",
                                        },
                                        {
                                            type: {
                                                type: "primitive" as const,
                                                value: {
                                                    type: "string" as const,
                                                },
                                            },
                                            statusCode: 404,
                                            description: "The requested SDK was not found",
                                        },
                                    ],
                                    errorsV2: [
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "UnauthorizedError",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 401,
                                            name: "Unauthorized Error",
                                            description: null,
                                        },
                                        {
                                            type: null,
                                            statusCode: 403,
                                            name: "User Not In Org Error",
                                            description: null,
                                        },
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "UnavailableError",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 503,
                                            name: "Unavailable Error",
                                            description: null,
                                        },
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "InvalidPageError",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 400,
                                            name: "Invalid Page Error",
                                            description: "Page must be >=1",
                                        },
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "ApiIdRequiredError",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 400,
                                            name: "Api Id Required Error",
                                            description: "An ApiId is required",
                                        },
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "OrgIdRequiredError",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 400,
                                            name: "Org Id Required Error",
                                            description: "An OrgId is required",
                                        },
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "OrgIdAndApiIdNotFound",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 400,
                                            name: "Org Id And Api Id Not Found",
                                            description: "The requested OrgId and ApiId was not found",
                                        },
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "OrgIdNotFound",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 404,
                                            name: "Org Id Not Found",
                                            description: "The requested OrgId was not found",
                                        },
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "ApiIdNotFound",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 404,
                                            name: "Api Id Not Found",
                                            description: "The requested ApId was not found",
                                        },
                                        {
                                            type: {
                                                type: "object" as const,
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "error",
                                                        valueType: {
                                                            type: "literal" as const,
                                                            value: {
                                                                type: "stringLiteral" as const,
                                                                value: "SDKNotFound",
                                                            },
                                                        },
                                                    },
                                                    {
                                                        key: "content",
                                                        valueType: {
                                                            type: "primitive" as const,
                                                            value: {
                                                                type: "string" as const,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            statusCode: 404,
                                            name: "Sdk Not Found",
                                            description: "The requested SDK was not found",
                                        },
                                    ],
                                    examples: [
                                        {
                                            description: null,
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets/load",
                                            pathParameters: {},
                                            queryParameters: {
                                                page: 1,
                                            },
                                            headers: {},
                                            requestBody: {
                                                orgId: "vellum",
                                                apiId: "vellum-ai",
                                                sdks: [
                                                    {
                                                        type: "python" as const,
                                                        package: "vellum-ai",
                                                        version: "1.2.1",
                                                    },
                                                ],
                                            },
                                            responseStatusCode: 200,
                                            responseBody: {
                                                next: 2,
                                                snippets: {
                                                    "/v1/search": {
                                                        GET: [
                                                            {
                                                                type: "python" as const,
                                                                sdk: {
                                                                    package: "vellum-ai",
                                                                    version: "1.2.1",
                                                                },
                                                                sync_client:
                                                                    'import Vellum from vellum.client\n\nclient = Vellum(api_key="YOUR_API_KEY")\nclient.search(query="Find documents written in the last 5 days")\n',
                                                                async_client:
                                                                    'import Vellum from vellum.client\n\nclient = Vellum(api_key="YOUR_API_KEY")\nclient.search(query="Find documents written in the last 5 days")\n',
                                                            },
                                                            {
                                                                type: "typescript" as const,
                                                                sdk: {
                                                                    package: "vellum-ai",
                                                                    version: "1.2.1",
                                                                },
                                                                client: 'import { VellumClient } from "vellum-ai";\n\nconst vellum = VellumClient({\n  apiKey="YOUR_API_KEY"\n})\nvellum.search({\n  query: "Find documents written in the last 5 days"\n})\n',
                                                            },
                                                        ],
                                                    },
                                                    "v1/document-indexes": {
                                                        POST: [
                                                            {
                                                                type: "python" as const,
                                                                sdk: {
                                                                    package: "vellum-ai",
                                                                    version: "1.2.1",
                                                                },
                                                                sync_client:
                                                                    'import Vellum from vellum.client\n\nclient = Vellum(api_key="YOUR_API_KEY")\nclient.document_indexes.create(name="meeting-reports", status="ACTIVE")\n',
                                                                async_client:
                                                                    'import VellumAsync from vellum.client\n\nclient = VellumAsync(api_key="YOUR_API_KEY")\nawait client.document_indexes.create(name="meeting-reports", status="ACTIVE")\n',
                                                            },
                                                            {
                                                                type: "typescript" as const,
                                                                sdk: {
                                                                    package: "vellum-ai",
                                                                    version: "1.2.1",
                                                                },
                                                                client: 'import { VellumClient } from "vellum-ai";\n\nconst vellum = VellumClient({\n  apiKey="YOUR_API_KEY"\n})\nvellum.documentIndexes.create({\n  name: "meeting-reports",\n  status: "ACTIVE"\n})\n',
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets/load",
                                            pathParameters: {},
                                            queryParameters: {
                                                page: 0,
                                            },
                                            headers: {},
                                            requestBody: {},
                                            responseStatusCode: 401,
                                            responseBody: {
                                                error: "UnauthorizedError",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets/load",
                                            pathParameters: {},
                                            queryParameters: {
                                                page: 0,
                                            },
                                            headers: {},
                                            requestBody: {},
                                            responseStatusCode: 403,
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets/load",
                                            pathParameters: {},
                                            queryParameters: {
                                                page: 0,
                                            },
                                            headers: {},
                                            requestBody: {},
                                            responseStatusCode: 503,
                                            responseBody: {
                                                error: "UnavailableError",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets/load",
                                            pathParameters: {},
                                            queryParameters: {
                                                page: 0,
                                            },
                                            headers: {},
                                            requestBody: {},
                                            responseStatusCode: 400,
                                            responseBody: {
                                                error: "InvalidPageError",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets/load",
                                            pathParameters: {},
                                            queryParameters: {
                                                page: 0,
                                            },
                                            headers: {},
                                            requestBody: {},
                                            responseStatusCode: 400,
                                            responseBody: {
                                                error: "ApiIdRequiredError",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets/load",
                                            pathParameters: {},
                                            queryParameters: {
                                                page: 0,
                                            },
                                            headers: {},
                                            requestBody: {},
                                            responseStatusCode: 400,
                                            responseBody: {
                                                error: "OrgIdRequiredError",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets/load",
                                            pathParameters: {},
                                            queryParameters: {
                                                page: 0,
                                            },
                                            headers: {},
                                            requestBody: {},
                                            responseStatusCode: 400,
                                            responseBody: {
                                                error: "OrgIdAndApiIdNotFound",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets/load",
                                            pathParameters: {},
                                            queryParameters: {
                                                page: 0,
                                            },
                                            headers: {},
                                            requestBody: {},
                                            responseStatusCode: 404,
                                            responseBody: {
                                                error: "OrgIdNotFound",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets/load",
                                            pathParameters: {},
                                            queryParameters: {
                                                page: 0,
                                            },
                                            headers: {},
                                            requestBody: {},
                                            responseStatusCode: 404,
                                            responseBody: {
                                                error: "ApiIdNotFound",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                },
                                            },
                                        },
                                        {
                                            descriptionContainsMarkdown: false,
                                            path: "/snippets/load",
                                            pathParameters: {},
                                            queryParameters: {
                                                page: 0,
                                            },
                                            headers: {},
                                            requestBody: {},
                                            responseStatusCode: 404,
                                            responseBody: {
                                                error: "SDKNotFound",
                                                content: "string",
                                            },
                                            codeExamples: {
                                                nodeAxios: "",
                                                pythonSdk: {
                                                    async_client:
                                                        'from fern.client import AsyncFern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = AsyncFern(\n    token="YOUR_TOKEN",\n)\nawait client.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                    sync_client:
                                                        'from fern.client import Fern\n\nfrom fern import PythonSdk, Sdk_Python\n\nclient = Fern(\n    token="YOUR_TOKEN",\n)\nclient.snippets.load(\n    page=1,\n    org_id="vellum",\n    api_id="vellum-ai",\n    sdks=[\n        Sdk_Python(\n            value=PythonSdk(\n                package="vellum-ai",\n                version="1.2.1",\n            )\n        )\n    ],\n)\n',
                                                },
                                            },
                                        },
                                    ],
                                    description: null,
                                    authed: true,
                                    descriptionContainsMarkdown: false,
                                },
                            ],
                            types: [
                                "type_snippets:EndpointIdentifier",
                                "type_snippets:EndpointPath",
                                "type_snippets:EndpointMethod",
                                "type_snippets:SDK",
                                "type_snippets:TypeScriptSDK",
                                "type_snippets:PythonSDK",
                                "type_snippets:GoSDK",
                                "type_snippets:JavaSDK",
                                "type_snippets:SnippetsPage",
                                "type_snippets:SnippetsByEndpointMethod",
                                "type_snippets:Snippet",
                                "type_snippets:TypeScriptSnippet",
                                "type_snippets:PythonSnippet",
                                "type_snippets:GoSnippet",
                                "type_snippets:JavaSnippet",
                            ],
                            subpackages: ["subpackage_snippets/commons"],
                            pointsTo: null,
                            urlSlug: "snippets",
                            description: null,
                            webhooks: [],
                            descriptionContainsMarkdown: false,
                        },
                        "subpackage_snippets/commons": {
                            subpackageId: "subpackage_snippets/commons",
                            parent: "subpackage_snippets",
                            name: "commons",
                            endpoints: [],
                            types: ["type_snippets/commons:OrgId", "type_snippets/commons:ApiId"],
                            subpackages: [],
                            pointsTo: null,
                            urlSlug: "commons",
                            description: null,
                            webhooks: [],
                            descriptionContainsMarkdown: false,
                        },
                    },
                    auth: {
                        type: "bearerAuth" as const,
                        tokenName: "token",
                    },
                    hasMultipleBaseUrls: false,
                },
            },
            files: {
                "c4997a9a-c3b3-4b2a-9adf-b82367736974":
                    "https://fdr-prod-docs-files.s3.us-east-1.amazonaws.com/fern.docs.buildwithfern.com/2023-11-04T14%3A20%3A45.596Z/images/logo-white.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA6KXJSKKNE6LAYO7B%2F20231104%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231104T142052Z&X-Amz-Expires=604800&X-Amz-Signature=1941dcf224a385b02933fdecaf43f6568142d3b33eb6e3c9297393bee971c44e&X-Amz-SignedHeaders=host&x-id=GetObject",
                "a54cdbaf-8fc1-4270-8a25-e8807923b767":
                    "https://fdr-prod-docs-files.s3.us-east-1.amazonaws.com/fern.docs.buildwithfern.com/2023-11-04T14%3A20%3A45.596Z/images/favicon.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA6KXJSKKNE6LAYO7B%2F20231104%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231104T142052Z&X-Amz-Expires=604800&X-Amz-Signature=a8ba2815c6d8cabad498d63c9f5a994a4d415fb93f5e4c708b91492724a8bcb8&X-Amz-SignedHeaders=host&x-id=GetObject",
                "9f6a8afe-fab3-430c-ad15-c7e1a46c9904":
                    "https://fdr-prod-docs-files.s3.us-east-1.amazonaws.com/fern.docs.buildwithfern.com/2023-11-04T14%3A20%3A45.596Z/images/background.svg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA6KXJSKKNE6LAYO7B%2F20231104%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231104T142052Z&X-Amz-Expires=604800&X-Amz-Signature=2720e5efd9d940dcae6fbb017d8bbb1f97b829d2c40ae8e3657ec21eb9535831&X-Amz-SignedHeaders=host&x-id=GetObject",
            },
            pages: {
                "pages/welcome/introduction.mdx": {
                    markdown:
                        "Fern is an [open source](https://github.com/fern-api/fern) toolkit for building\nREST APIs. With Fern, you can generate SDKs, API documentation,\nand boilerplate for your backend server.\n\nFern is **fully compatible with OpenAPI**. Leverage your existing OpenAPI\nspecification to generate code and documentation through Fern. If you're not a fan of\nOpenAPI, you can also use Fern's simpler format to define your API.\n\n## Overview of Fern \n\n![Overview of Fern](https://fern-image-hosting.s3.amazonaws.com/Fern+Overview.png)\n\n\n## Fern's Magic 🪄\n\nThe magic of Fern is our compiler, which transforms your API definition into:\n\n- **SDKs.** Client libraries that **feel handwritten** and are published to package managers like npm and PyPI.\n- **Documentation.** A beautiful docs website with a best-in-class API Reference. Automatically sync your Postman Collection\n- **Backend boilerplate.** Server side code, such as Pydantic models for FastAPI and Jersey interfaces for Spring Boot. Get compile-time validation that your endpoints are being served correctly.\n\n",
                },
                "pages/welcome/quickstart.mdx": {
                    markdown:
                        "### Install\n\n```bash\nnpm install -g fern-api\n```\n\n### Already have an OpenAPI spec?\n\nImport your OpenAPI spec into Fern [here](./spec/openapi).\n\n### The `fern/` directory\n\nThe `fern/` directory contains your Fern configuration. This generally lives in your\nbackend repo, but you can also have an independent repo dedicated to your API (like [Seam's](https://github.com/seamapi/fern-config)).\n\nIn the root of your repo, run:\n\n```bash\nfern init\n```\n\nThis will create the following folder structure in your project:\n\n```yaml\nfern/\n├─ fern.config.json # root-level configuration\n└─ api/ # your API\n  ├─ generators.yml # generators you're using\n  └─ definition/\n    ├─ api.yml  # API-level configuration\n    └─ imdb.yml # endpoints, types, and errors\n```\n\n### Generating an SDK\n\nTo generate the TypeScript SDK and an OpenAPI spec, run:\n\n```bash\nfern generate\n```\n\nBy default, `generators.yml` is configured to generate a TypeScript SDK and an\nOpenAPI spec. You can read more about generation on the [`fern generate`](./compiler/fern-generate) \npage.\n\n### Defining your API\n\n```yaml imdb.yml\ntypes:\n  MovieId: string\n\n  Movie:\n    properties:\n      id: MovieId\n      title: string\n      rating:\n        type: double\n        docs: The rating scale is one to five stars\n        \nservice:\n  auth: false\n  base-path: /movies\n  endpoints:\n    getMovie:\n      method: GET\n      path: /{movieId}\n      path-parameters:\n        movieId: MovieId\n      response: Movie\n      errors:\n        - MovieDoesNotExistError\n\nerrors:\n  MovieDoesNotExistError:\n    status-code: 404\n    type: MovieId\n```\n\nYour **Fern Definition** is a set of YAML files that describe your API. You can\nlearn more about this in the [Define your API](./definition/definition) section.\n\n### Running the Fern compiler\n\nThe Fern compiler takes your Fern Definition and generates useful outputs, like\nSDKs. You can learn more about configuring outputs in the [Compiler](./compiler/generators)\nsection.\n",
                },
                "pages/welcome/why-fern.mdx": {
                    markdown:
                        "Amazon built [Smithy](https://github.com/smithy-lang/smithy). Palantir built\n[Conjure](https://github.com/palantir/conjure). Google built [gRPC](https://github.com/grpc/grpc). Facebook built [GraphQL](https://github.com/graphql/graphql-spec) and [Thrift](https://github.com/facebook/fbthrift). \n\nThese inventions all share a common design: **schema-first automation for API\ndevelopment.** This saves developer time and increases product\nvelocity.\n\nWe built Fern to productize this design and make it accessible to all\nsoftware companies.\n\n## Schema-first API design\n\nFern embraces schema-first API design: **You first define your API in Fern.**\nAfter that, you implement your API and generate helpful outputs, like SDKs or API documentation.\n\nWith schema-first API design, you unlock a few benefits:\n\n1. **Best practices built-in.** Our compiler will warn you against common\n   anti-patterns and pitfalls.\n2. **A single source of truth.** No more keeping your OpenAPI spec up-to-date\n   with your backend. Out-of-date documentation is a problem of the past.\n3. **A simple format encourages collaboration**. An easy-to-write format means\n   that backend and frontend devs can collaborate on API design. If you have\n   multiple dev teams, a standardized format makes it easy for teams to learn\n   about and consume each other's APIs.\n\n## Product velocity\n\n<i>\n  \"Building 2 new APIs this last 1.5 weeks with Fern was awesome - I bet it sped\n  up new API development by at least 50%.  The bits that were sped up was the\n  most tedious, annoying bits too. Very thankful to be using Fern right now!\"\n\n&nbsp;&nbsp;&nbsp;&nbsp; \\- Steve Yazicioglu, Head of Engineering, Candid Health\n\n</i>\n\nThe Fern compiler handles the tedious and time-consuming developer work\nthat goes into building a new API. **This frees up developer time to build your\nproduct faster.**\n\nOn the server-side, Fern generates the types and networking logic for you. Just\nimplement the business logic, and you're good to go.\n\nWhen consuming your new API, Fern's auto-generated SDKs are a dream.\nYou get client libraries to use in tests, your frontend,\nand other microservices. They let you build faster.\n\n- **Think in terms of operations, not HTTP.** Endpoint calls are just function\n  calls. No need to hardcode HTTP paths or append query parameters.\n- **Type safety** to ensure you're using the API correctly. If you're not, you'll get compile errors.\n- **Auto-completion in code editors** instead of reading backend code to understand the API.\n\nAnd unlike most auto-generated SDKs, ours are idiomatic and feel handwritten.\nYou'll be excited to show them off to your customers.\n",
                },
                "pages/welcome/generators.mdx": {
                    markdown:
                        "Fern's generators are written in the language they generate. They're open source and actively maintained, so you can raise a PR or open an issue if you'd like to suggest an improvement.\n\n## SDK language support\n\nWhether you call them SDKs, client libraries, or wrappers, Fern's generators create code that makes it easier for developers to integrate with your API.\n\n| Language | Availability | Package Manager | `fern add <generator>` command\n| -------- | -------- | -------- | -------- |\n| [TypeScript](../sdks/node-sdk)  | Generally available | NPM  | `fernapi/fern-typescript-node-sdk`\n| [Python](../sdks/python-sdk)  | Generally available  | PyPI  | `fernapi/fern-python-sdk`\n| [Go](../sdks/go-sdk)  | Generally available  | Proxy Module  | `fernapi/fern-go-sdk`\n| [Java](../sdks/java-sdk)  | Generally available  | Maven  | `fernapi/fern-java-sdk`\n| [C#](../sdks/csharp-sdk)  | In development  | NuGet  | `fernapi/fern-csharp-sdk`\n| [Ruby](../sdks/ruby-sdk)  | Coming by end of year | Gems  | `fernapi/fern-ruby-sdk`\n| [PHP](../sdks/php-sdk)  | Coming next year | Packagist  | `fernapi/fern-php-sdk`\n\n*Looking for a language that's not listed? [Let us know.](support@buildwithfern.com)*\n\n## Server boilerplate framework support\n\nWhether you call them server interfaces, server stubs, or API implementation stubs, Fern's generators create boilerplate for your backend that makes it easier for you to implement your API. Plus, your API will be consistent across your server, clients, and docs.\n\n| Framework | Language | Availability | `fern add <generator>` command\n| -------- | -------- | -------- | -------- |\n| [Express](../server-boilerplate/express)  | JavaScript | Generally available  | `fernapi/fern-typescript-express`\n| [FastAPI](../server-boilerplate/fastapi)  | Python  | Generally available  | `fernapi/fern-fastapi-server`\n| [Spring](../server-boilerplate/spring)  | Java  | Generally available  | `fernapi/fern-java-spring`\n| [Go standard library](../server-boilerplate/go)  | Go | Coming next year  | `fernapi/fern-go-server`\n| [.NET](../server-boilerplate/dotnet)  | C#  | Coming next year  | `fernapi/fern-csharp-dotnet`\n| [Ruby on Rails](../server-boilerplate/ruby-on-rails)  | Ruby | Coming next year  | `fernapi/fern-ruby-rails`\n| [Laravel](../server-boilerplate/laravel)  | PHP | Coming next year  | `fernapi/fern-php-laravel`\n| [Django](../server-boilerplate/django)  | Python | Coming next year  | `fernapi/fern-python-django`\n| [Flask](../server-boilerplate/flask)  | Python | Coming next year  | `fernapi/fern-python-flask`\n\n*Looking for a framework that's not listed? [Let us know.](support@buildwithfern.com)*\n\n## Releases\n\nAll generator releases are published in the `Releases` section of the GitHub repository. You can directly use these version numbers in your generator configuration files.\n\n![Releases on GitHub](https://fern-image-hosting.s3.amazonaws.com/releases-github.png)\n\nFor example, if you want to pin to a specific version of the TypeScript/Node.js SDK generator, `0.7.1`, you can use the following configuration:\n\n```yaml\ngroups:\n  my-group:\n    generators:\n      - name: fernapi/fern-typescript-node-sdk\n        version: 0.7.1\n```",
                },
                "pages/cli/overview.mdx": {
                    markdown:
                        'The Fern Command Line Interface (Fern CLI) is an open source tool that enables you to interact with the Fern compiler using commands in your command-line shell. Use the Fern CLI to generate code from your API definition.\n\n## Fern compiler\n\nUnlike most compilers, the Fern compiler does not produce a single output. Here\nare some examples of what the Fern compiler can output:\n\n- A TypeScript Node.js SDK\n- FastAPI server boilerplate\n- A Postman Collection\n- An OpenAPI Specification\n\nTo support the long and growing list of outputs, we\'ve built the Fern Compiler\nto be **modular.** The core compiler is responsible for parsing and validating\nyour API definition and producing the intermediate representation.\n\nThe remaining work is handled by **generators.** A Fern generator is a program\nthat takes in an intermediate representation and outputs... something. Generators can be written in any language.\n\nspecify which generators you want the compiler to run using the special file\n`generators.yml`. You can view the list of available generators [here](generators).\n\n## Generator schema \n\nIn this section, we\'ll detail the different properties you need to include for a\ngenerator.\n\n### Name\n\nEach generator has a unique name, e.g., `fernapi/fern-typescript-node-sdk`.\n\n<CodeBlock title="generators.yml">\n```yaml\ngroups:\n  external:\n    generators:\n      - name: fernapi/fern-typescript-node-sdk # <---\n```\n</CodeBlock>\n\n### Version\n\nYou must specify which version of the generator you want to use. This helps\nensure consistent builds.\n\n<CodeBlock title="generators.yml">\n```yaml\ngroups:\n  external:\n    generators:\n      - name: fernapi/fern-typescript-node-sdk\n        version: 0.7.2 # <---\n```\n</CodeBlock>\n\n### Default group\n\nYou can also specify a `default-group` in `generators.yml`:\n\n<CodeBlock title="generators.yml">\n```yaml\ndefault-group: internal-sdks\ngroups:\n  internal-sdks: ...\n```\n</CodeBlock>\n\nThen, you can just run `fern generate` to run the `internal-sdks` generator(s).\n\n### Configuration\n\nSome generators allow for custom configuration, which you can specify using the optional `config` key.\n\n<CodeBlock title="generators.yml">\n```diff \n groups:\n   external:\n       - name: fernapi/fern-openapi\n         version: 0.0.28\n         github:\n           repository: your-org/openapi\n+        config:\n+          format: yaml\n```\n</CodeBlock>\n\n### Authentication required\n\nFern\'s CLI requires user authentication for code generation:\n\n- If prompted, proceed with authentication by typing `y` and pressing enter.\n- Alternatively, initiate the process using `fern login`. This command will either prompt you to log in or confirm that you\'re already authenticated.\n\nOnce authenticated:\n\n**Permission Verification**: Fern checks your credentials to grant access for specific actions, such as publishing your SDK to dedicated registries (e.g., npm.buildwithfern.com), syncing code to GitHub, or deploying a documentation site.\n\n- **Proactive Support**: Encountered an error? We can promptly intervene and assist with troubleshooting.\n\n- **Enhancing User Experience**: Fern collects usage analytics to improve the product.\n\n**Feedback:** Have thoughts on this login requirements? Join the discussion on [this GitHub Issue](https://github.com/fern-api/fern/issues/2003)\n\n',
                },
                "pages/cli/fern-generate.mdx": {
                    markdown:
                        'Use `fern generate` to run the Fern compiler for creating SDKs or documentation for your API. By default, Fern runs generators in the cloud\nin isolated, containerized environments.\n\n## Command flags \n\n### For SDKs\n\n<CodeBlock title = "SDK Generation Command">\n```bash\n$ fern generate [--group <group>] [--version <version>] [--local] [--keepDocker] [--log-level debug]\n```\n</CodeBlock>\n\n### For Documentation\n\n<CodeBlock title = "Documentation Generation Command">\n```bash\n$ fern generate [--docs <instance-url>] [--log-level debug]\n```\n</CodeBlock>\n\n## Command flags explained \n\n### Group\n\n**Type**: `string`\n**Description:** Filter to a specific group within `generators.yml`. Required unless you have a `default-group` declared in `generators.yml`.\n\n**Example:**\n\n```bash\n$ fern generate --group internal\n```\n\n### Version\n\n**Type**: `string`\n**Description:** Specify a version for SDKs and documentation. Adherance to [semantic versioning](https://semver.org/) is advised.     \n\n**Example**\n```bash\n$ fern generate --version 2.1.1\n```\n\n### Local\n\n**Requirement**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) must be installed and running on your machine.\n\n**Type**: `boolean`\n**Description**: Use the `--local` option to generate code locally. This downloads the Docker Image and runs it on your machine.\n\n```bash\n$ fern generate --local\n```\n\nRunning a Docker locally supports outputting files. It does not support publishing to package managers.\n\n### Keep Docker\n\n**Requirement**: Docker Desktop should be ready on your local machine.\n\n**Type**: `boolean`\n**Description**: Use the `--keepDocker` option to keep the Docker container running after the generation is complete. This is useful for debugging.\n\n```bash\n$ fern generate --local --keepDocker\n```\n\n### Instance URL \n\n**Type**: `string`\n**Description**: Use the `instance` option to specify an instance URL to generate documentation for. This is useful if you have multiple instances of your API.\n\n```bash\n$ fern generate --docs --instance instance your-organization.docs.buildwithfern.com\n```\n\n## Debugging logs\n\n**Type**: `choices` "debug", "info", "warn", "error"\n**Default**: `info`\n\nTo see more information about what Fern is doing, use the `--log-level` option. \n\n```bash\n$ fern generate --log-level debug \n```\n\n- **info**: Informational messages, warnings, and errors are logged.\n- **debug**: Debug messages, informational messages, warnings, and errors are logged.\n- **error**: Only error messages are logged.\n- **warn**: Warning messages and above (i.e., warnings and errors) are logged.\n',
                },
                "pages/cli/fern-check.mdx": {
                    markdown:
                        "Use `fern check` to validate your API definition and Fern configuration. Your Fern configuration includes `gern.config.json`, `generators.yml`, and `docs.yml`.\n\n## Usage\n\n```bash\n$ fern check\n```\n\n## Usage in a GitHub Action \n\n<CodeBlock title = \".github/workflows/fern-check.yml\">\n```yml \nname: Fern API Validation Check\n\non:\n  pull_request:\n    branches:\n      - main\n\njobs:\n  validate-fern-api:\n    name: Validate using Fern API\n    runs-on: ubuntu-latest\n\n    steps:\n      - name: Checkout repository\n        uses: actions/checkout@v4\n\n      - name: Set up Node.js\n        uses: actions/setup-node@v2\n        with:\n          node-version: '14'\n\n      - name: Install Fern API\n        run: npm install -g fern-api\n\n      - name: Validate API with Fern\n        run: fern check\n```\n</CodeBlock>",
                },
                "pages/cli/fern-add.mdx": {
                    markdown:
                        'Use `fern add <generator>` to include a new generator in your `generators.yml`.\n\n## Usage\n\n```bash\n$ fern add <generator>\n```\n\nView a complete list of [available generators](./pages/welcome/generators.mdx).\n\n## Example \n\n<CodeBlocks>\n    <CodeBlock title="Node.js SDK">\n    ```bash\n    fern add fern-typescript-node-sdk\n    ```\n    </CodeBlock>\n\n    <CodeBlock title="Python SDK">\n    ```bash\n    fern add fern-python-sdk\n    ```\n    </CodeBlock>\n\n    <CodeBlock title="Go SDK">\n    ```bash\n    fern add fern-go-sdk\n    ```\n    </CodeBlock>\n\n    <CodeBlock title="Postman Collection">\n    ```bash\n    fern add fern-postman\n    ```\n    </CodeBlock>\n\n    <CodeBlock title="FastAPI">\n    ```bash\n    fern add fern-fastapi-server\n    ```\n    </CodeBlock>\n\n</CodeBlocks>\n',
                },
                "pages/cli/fern-init.mdx": {
                    markdown:
                        "`fern init` adds a new API to your repo. By default, you'll see the `IMDb Movie API` example.\n\n## Usage\n\n```bash\n$ fern init\n```",
                },
                "pages/cli/fern-write-definition.mdx": {
                    markdown:
                        "`fern write-definition` will convert your OpenAPI specification into a Fern Definition. You'll see a new folder called `definition` created.\n\n```\nfern/\n├─ fern.config.json\n├─ generators.yml\n└─ openapi/\n  └─ openapi.json\n└─ definition/ <--- your Fern Definition\n  └─ api.yml\n  └─ __package__.yml\n```\n\nWhen you have an `openapi` folder and a `definition` folder, Fern defaults to reading your OpenAPI spec. Remove the `openapi` folder if you'd like to use your Fern Definition as an input to Fern's generators.",
                },
                "pages/cli/fern-upgrade.mdx": {
                    markdown:
                        "## fern upgrade [--rc]\n\n`fern upgrade` will upgrade your compiler version in `fern.config.json` to the\nlatest version. It will also upgrade generators in `generators.yml` to their minimum-compatible versions.\n\n## Usage\n\n```bash\n$ fern upgrade\n```\n\n## Release candidates\n\nBy adding `--rc`, you can upgrade to the compiler's latest release candidate. Using a release candidate is not recommended for production use.\n\n```bash\n$ fern upgrade --rc\n```",
                },
                "pages/cli/fern-login.mdx": {
                    markdown: "`fern login` will login to the Fern CLI.\n\n## Usage\n\n```bash\n$ fern login\n```",
                },
                "pages/cli/fern-register.mdx": {
                    markdown:
                        "`fern register ` You can register your API so it can be depended on by other APIs. Read more in the Depending on other APIs section.\n\n## Usage\n\n```bash\n$ fern register\n```",
                },
                "pages/cli/fern-format.mdx": {
                    markdown:
                        "Use `fern format` to format the YAML of your Fern Definition.\n\n## Usage\n\n```bash\n$ fern format\n```",
                },
                "pages/cli/fern-help.mdx": {
                    markdown:
                        'Use `fern help` to see a list of available commands and a short description of each.\n\n## Usage\n\n```bash\n$ fern help\n```\n\n## Output\n\n```bash\nCommands:\n  fern init             Initialize a Fern API\n  fern add <generator>  Add a code generator to generators.yml\n  fern generate         Generate all generators in the specified group\n  fern check            Validates your Fern Definition\n  fern login            Log in to Fern via GitHub\n  fern format           Formats your Fern Definition\n  fern upgrade          Upgrades version in fern.config.json. Also upgrades\n                        generators in generators.yml to their minimum-compatible\n                        versions.\n\nOptions:\n      --help       Show help [boolean]\n      --log-level  [choices: "debug", "info", "warn", "error"] [default: "info"]\n  -v, --version    Print current version\n  ```',
                },
                "pages/cli/fern-version.mdx": {
                    markdown:
                        "Use `fern version` to check the currently installed version.\n\n## Usage\n\n```bash\n$ fern --version\n```\n\n## Example outputs \n\n```bash\n$ fern --version\n0.14.3\n```\n\n```bash\n$ fern --version\n0.15.0-rc53\n```",
                },
                "pages/guides/publish-to-maven-central.mdx": {
                    markdown:
                        "The following is a guide on how to publish your SDK (referred to as an `artifact`) to Maven Central.\n\n## Step 1: Decide what your Maven `groupId` will be .\n\nWe recommend using a reverse domain name, as it's a common convention and it's easy to remember. \n\nFor example:\n    - `stripe.com` becomes `com.stripe`\n    - `aws.amazon.com` becomes `com.amazonaws`\n    - `twilio.com` becomes `com.twilio.sdk` (they added `sdk` to avoid a conflict with an existing groupId)\n    - `archive.org` becomes `org.archive`   \n    - `zookeeper.apache.org` becomes `org.apache.zookeeper`\n\nAlternatively, you can use your GitHub org name. For example, `github.com/segmentio` becomes `io.segment`.\n\n<br />\n\n---\n\n## Step 2: Create an account on Sonatype Jira. Create an account [here](https://issues.sonatype.org/secure/Signup!default.jspa).\n\nSonatype is a company that runs the Maven Central Repository, which is where we will be uploading our artifacts to.\n\n<br />\n\n---\n\n## Step 3: Create a new issue by hitting the Create button.\n\n![Create](https://fern-image-hosting.s3.amazonaws.com/sonatype-create-button.png)\n\n<br />\n\n---\n\n## Step 4: Fill out the form. \n\n- Select `Community Support - Open Source Project Repository Hosting (OSSRH)` for Project. \n\n- Select `New Project` for Issue Type.\n\n![Create Issue](https://fern-image-hosting.s3.amazonaws.com/sonatype-create-issue-form.png)\n\n<br />\n\n---\n\n## Step 5: Prove ownership in the ticket.\n\nBefore granting you the `groupId` you requested, Sonatype will ask you to prove ownership of either the GitHub org or domain name that you based your `groupId` on.\n\nIn the case of a domain name, you will be asked to add a DNS TXT to your domain. Example ticket [here](https://issues.sonatype.org/browse/OSSRH-76115?jql=text%20~%20%22com%22).\n\nIn the case of GitHub org, you will be asked to create a repo and the bot will check that the repo has been created. Example ticket [here](https://issues.sonatype.org/browse/OSSRH-85770). \n\n<br />\n\n---\n\n## Step 6: You're ready to publish to your Maven repository! \n\n- Your `Maven coordinate` is `<groupId>:<artifactId>`\n- Your `Maven username` is the username of your Sonatype account. \n- Your `Maven password` is the password of your Sonatype account.\n\n<br />\n\n---\n\n## Step 7: Choose your artifact name.\n\nPicking an `artifactId` is a personal preference.  Here are examples for inspiration:\n\n- `stripe-java` [this is our recommended approach]\n- `slack-api-client`\n- `twilio`\n- `aws-java-sdk-s3`\n\nGoing forward, when referencing the artifact you'll use the `groupId` and `artifactId` together. For example:\n\n- `com.stripe:stripe-java`\n- `com.slack.api/slack-api-client`\n- `dev.merge:merge-java-client`\n- `com.amazonaws:aws-java-sdk-s3`",
                },
                "pages/openapi/import.mdx": {
                    markdown:
                        "To use an OpenAPI spec, you can pass in the filepath or URL. \n\nTo pass in an OpenAPI spec from a filepath:\n\n```bash\nnpm install -g fern-api\nfern init --openapi <filepath to openapi>\n```\n\nAlternatively, to point to the URL of an OpenAPI spec:\n\n```bash\nnpm install -g fern-api\nfern init --openapi <url to openapi>\n\n```\n\nFern will generate the following directory with your OpenAPI spec inside of it.\n\n```bash\nfern/\n├─ fern.config.json\n└─ api/\n  ├─ generators.yml\n  └─ openapi/\n    └─ openapi.json # <--- your openapi file\n```\n\nRun `fern check` to validate the OpenAPI spec. Resolve any errors. Having trouble? Reach out in the [Fern Discord server](https://discord.com/invite/JkkXumPzcG). \n\nIf you're having trouble understanding the errors, run the command `fern write-definition`. This command will convert your OpenAPI spec into a Fern Definition. [Read more.](../compiler/cli-reference.mdx#fern-write-definition)\n\nIf there are no errors, you can run [fern generate](../compiler/fern-generate).\n",
                },
                "pages/openapi/extensions.mdx": {
                    markdown:
                        'Fern supports different OpenAPI extensions so that you can generate higher-quality SDKs.\n\n<Callout intent="info">\nTip: If there\'s an extension you want that doesn\'t already exist, file an [issue](https://github.com/fern-api/fern/issues/new).\n</Callout>\n\n## SDK method names\n\nBy default, Fern uses the `tag` and `operationId` fields to generate the SDK method. So an endpoint with a\ntag `users` and operationId `users_create` will generate an SDK that reads `client.users.create()`.\n\nTo explicitly set the SDK method you can leverage the extensions:\n\n- `x-fern-sdk-group-name` which groups SDK methods together\n- `x-fern-sdk-method-name` which is used as the method name in the SDK\n\nThe OpenAPI below will `client.users.create()`:\n\n```yaml openapi.yaml\npaths:\n  /users\n    post:\n      x-fern-sdk-group-name: users\n      x-fern-sdk-method-name: create\n```\n\nIf you omit the `x-fern-sdk-group-name` extension, then the generated SDK method will live at the root.\nFor example, the following OpenAPI will generate `client.create_user()`:\n\n```yaml openapi.yaml\npaths:\n  /users:\n    post:\n      x-fern-sdk-method-name: create_user\n```\n\n## Enum descriptions and names\n\nOpenAPI doesn\'t natively support adding descriptions to enum values. To do this in Fern you can use the `x-fern-enum`\nextension.\n\nIn the example below, we\'ve added some descriptions to enum values. These descriptions will\npropagate into the generated SDK and docs website.\n\n```yaml openapi.yml\ncomponents:\n  schemas:\n    CardSuit:\n      enum:\n        - clubs\n        - diamonds\n        - hearts\n        - spades\n      x-fern-enum: # <------\n        clubs:\n          description: Some docs about clubs\n        spades:\n          description: Some docs about spades\n```\n\n`x-fern-enum` also supports a `name` field that allows you to customize the name of the enum in code.\nThis is particularly useful when you have enums that rely on symbolic characters that would otherwise cause\ngenerated code not to compile.\n\nFor example, the following OpenAPI\n\n```yaml openapi.yml\ncomponents:\n  schemas:\n    Operand:\n      enum:\n        - >\n        - <\n      x-fern-enum:\n        >:\n          name: GreaterThan\n          description: Checks if value is greater than\n        <:\n          name: LessThan\n          description: Checks if value is less than\n```\n\nwould generate\n\n```typescript operand.ts\nexport enum Operand {\n  GreaterThan = ">",\n  LessThan = "<",\n}\n```\n\n## Schema names\n\nOpenAPI allows you to define inlined schemas that do not have names.\n\n```yaml openapi.yml\ncomponents:\n  schemas:\n    Movie:\n      type: object\n      properties:\n        name:\n          type: string\n        cast:\n          type: array\n          items:\n            type: object # <---------- Inline Type\n            properties:\n              firstName:\n                type: string\n              lastName:\n                type: string\n              age:\n                type: integer\n```\n\nFern automatically generates names for all the inlined schemas. For example, in this example,\nFern would generate the name `CastItem` for the inlined array item schema.\n\n```typescript\nexport interface Movie {\n    name?: string;\n    cast?: CastItem[]\n}\n\nexport interface CastItem  { # <----- Auto-generated name\n    firstName?: string;\n    lastName?: string;\n    age?: integer;\n}\n```\n\nIf you want to override the generated name, you can use the extension `x-fern-type-name`.\n\n```yaml openapi.yml\ncomponents:\n  schemas:\n    Movie:\n      type: object\n      properties:\n        name:\n          type: string\n        cast:\n          type: array\n          items:\n            type: object\n            x-fern-type-name: Person # <----------\n            properties:\n              firstName:\n                type: string\n              lastName:\n                type: string\n              age:\n                type: integer\n```\n\nThis would replace `CastItem` with `Person` and the generated code would read more idiomatically:\n\n```typescript\nexport interface Movie {\n    name?: string;\n    cast?: Person[]\n}\n\nexport interface Person  { # <----- Overridden name\n    firstName?: string;\n    lastName?: string;\n    age?: integer;\n}\n```',
                },
                "pages/openapi/export.mdx": {
                    markdown:
                        "To export your API to OpenAPI from Fern, you can use the `fern-openapi` generator. The OpenAPI generator outputs an OpenAPI 3.1 document for your API, which can be used with any OpenAPI-compatible tools.\n\nHere is an example of how you can configure the fern-openapi generator in your generators.yml file:\n\n<CodeBlock title=\"generators.yml\">\n```\n- name: fernapi/fern-openapi\n  version: 0.0.28\n  config:\n    format: yaml #options are yaml or json\n  github:\n    repository: your-organization/your-repository\n  ```\n</CodeBlock>\n\n## Configuration options \n\nThe following options are available:\n\n### Format\n\n- `format`: Allows you to control the name of the generated namespace export and client class. By default, the exported namespace and client are named based on the organization and API names in the Fern Definition.\n\n**Type**: string, enum of 'json' | 'yaml'\n\n**Default:** `yaml`\n\nWhen configured, the generator outputs OAS files in the specified format.\n\n#### Custom overrides\n\n**Type:** object\n\n**Default:** {}\n\nWhen configured, the object is merged into the generated OAS file. This allows you to add custom fields to the specification.",
                },
                "pages/fern-definition/definition.mdx": {
                    markdown:
                        'A Fern Definition is a set of YAML files that describe your API.\n\nEach **Fern Definition** file may define:\n\n- **[Custom types](/definition/types)**. Use **custom types** to build your data model.\n- **[Services](/definition/services)**. A **service** is a set of related REST endpoints.\n- **[Errors](/definition/errors)**. An **error** represents a failed (non-200) response from an endpoint.\n\n## An example of a Fern Definition\n\n<CodeBlock title="imdb.yml">\n```yml \nservice:\n  auth: false\n  base-path: /movies\n  endpoints:\n    createMovie:\n      docs: Add a movie to the database\n      method: POST\n      path: /create-movie\n      request: CreateMovieRequest\n      response: MovieId\n\n    getMovie:\n      method: GET\n      path: /{movieId}\n      path-parameters:\n        movieId: MovieId\n      response: Movie\n      errors:\n        - NotFoundError\n        - UnauthorizedError\n\ntypes:\n  Movie:\n    properties:\n      title: string\n      rating:\n        type: double\n        docs: The rating scale from one to five stars\n      id:\n        type: MovieId\n        docs: The unique identifier for a movie\n\n  CreateMovieRequest:\n    properties:\n      title: string\n      rating: double\n\nerrors:\n  NotFoundError:\n    http:\n      statusCode: 404\n    type:\n      properties:\n        id: MovieId\n\n  UnauthorizedError:\n    http:\n      statusCode: 401\n```\n</CodeBlock>\n',
                },
                "pages/fern-definition/types.mdx": {
                    markdown:
                        'Types describe the data model of your API.\n\n## Built-in types\n\n- **`string`**\n- **`integer`**\n- **`long`**\n- **`double`**\n- **`boolean`**\n- **`datetime`** _An [RFC 3339, section 5.6 datetime](https://ijmacd.github.io/rfc3339-iso8601/). For example, `2017-07-21T17:32:28Z`._\n- **`date`** _An RFC 3339, section 5.6 date (YYYY-MM-DD). For example, `2017-07-21`._\n- **`uuid`**\n- **`base64`**\n- **`list`** _e.g., list\\<string\\>_\n- **`set`** _e.g., set\\<string\\>_\n- **`map`** _e.g., map\\<string, integer\\>_\n- **`optional`** _e.g., optional\\<string\\>_\n- **`unknown`** _Represents arbitrary JSON._\n\n## Custom types\n\nCreating your own types is easy in Fern!\n\n### Objects\n\nThe most common custom types are **objects**.\n\nIn Fern, you use the `"properties"` key to create an object:\n\n```yaml\ntypes:\n  Person:\n    properties: # <---\n      name: string\n      address: Address\n\n  Address:\n    properties: # <---\n      line1: string\n      line2: optional<string>\n      city: string\n      state: string\n      zip: string\n```\n\nThese represent JSON objects:\n\n```json\n{\n  "name": "Alice",\n  "address": {\n    "line1": "123 Happy Lane",\n    "city": "New York",\n    "state": "NY",\n    "zip": "10001"\n  }\n}\n```\n\nYou can also use **extends** to compose objects:\n\n```yaml\ntypes:\n  Pet:\n    properties:\n      name: string\n  Dog:\n    extends: Pet\n    properties:\n      breed: string\n```\n\nYou can extend multiple objects: \n\n```yaml \ntypes: \n  GoldenRetriever: \n    extends: \n      - Dog \n      - Pet \n    properties: \n      isGoodBoy: boolean\n```\n\n### Aliases\n\nAn Alias type is a renaming of an existing type. This is usually done for clarity.\n\n```yaml\ntypes:\n  # UserId is an alias of string\n  UserId: string\n\n  User:\n    properties:\n      id: UserId\n      name: string\n```\n\n### Enums\n\nAn enum represents a string with a set of allowed values.\n\nIn Fern, you use the `"enum"` key to create an enum:\n\n```yaml\ntypes:\n  WeatherReport:\n    enum: # <---\n      - SUNNY\n      - CLOUDY\n      - RAINING\n      - SNOWING\n```\n\n### Unions\n\nFern supports tagged unions (a.k.a. discriminated unions). Unions are useful for\npolymorphism. This is similar to the `oneOf` concept in OpenAPI.\n\nIn Fern, you use the `"union"` key to create an union:\n\n```yaml\ntypes:\n  Animal:\n    union:\n      dog: Dog\n      cat: Cat\n  Dog:\n    properties:\n      likesToWoof: boolean\n  Cat:\n    properties:\n      likesToMeow: boolean\n```\n\nIn JSON, unions have a **discriminant property** to differentiate between\ndifferent members of the union. By default, Fern uses `"type"` as the\ndiscriminant property:\n\n```json\n{\n  "type": "dog",\n  "likesToWoof": true\n}\n```\n\nYou can customize the discriminant property using the "discriminant" key:\n\n```diff\n types:\n   Animal:\n+    discriminant: animalType\n     union:\n       dog: Dog\n       cat: Cat\n   Dog:\n     properties:\n       likesToWoof: boolean\n   Cat:\n     properties:\n       likesToMeow: boolean\n```\n\nThis corresponds to a JSON object like this:\n\n```json\n{\n  "animalType": "dog",\n  "likesToWoof": true\n}\n```\n\nYou can also have a union without a discriminant.\n\n```\nMyUnion:\n  discriminated: false\n  union:\n    - string\n    - integer\n```\n\n### Documentation\n\nYou can add documentation for types. These docs are passed into the compiler,\nand are incredibly useful in the generated outputs (e.g., docstrings in SDKs).\n\n```yaml\ntypes:\n  Person:\n    docs: A person represents a human being\n    properties:\n      name: string\n      age:\n        docs: age in years\n        type: integer\n```\n\n```typescript Generated TypeScript SDK\n/**\n * A person represents a human being\n */\ninterface Person {\n  name: string;\n  // age in years\n  age: number;\n}\n```\n\n### Examples\n\nYou can add examples for types. These are passed into the compiler to be used in\nthe generated outputs (e.g., examples in the Postman collection).\n\n```yaml\ntypes:\n  UserId:\n    docs: A unique identifier for a user\n    type: string\n    examples:\n      - value: user-id-123\n```\n\n```typescript Generated TypeScript SDK\n/**\n * A unique identifier for a user\n *\n * @example "user-id-123"\n */\ntype UserId = string;\n```\n\nThe Fern compiler validates that your examples match the expected types. For\nexample, this won\'t compile:\n\n```yaml\ntypes:\n  UserId:\n    type: integer\n    examples:\n      - value: hello # not an integer\n```\n\n#### Referencing examples from other types\n\nJust like types, you can compose examples. To reference an example from another\ntype, use `$`.\n\n```yaml\ntypes:\n  UserId:\n    type: integer\n    examples:\n      - name: Example1\n        value: user-id-123\n\n  User:\n    properties:\n      id: UserId\n      name: string\n    examples:\n      - value:\n          id: $UserId.Example1 # <---\n          name: Jane Smith\n```\n',
                },
                "pages/fern-definition/endpoints.mdx": {
                    markdown:
                        'In Fern, you organize related endpoints into a **Service.** This grouping\nimproves clarity and makes the generated SDKs more idiomatic.\n\n## Service Definition\n\nEach service defines:\n\n1. A **base-path**: A common prefix for all the endpoints\'s HTTP paths\n2. Whether the service requires [authentication](./api-yml#authentication)\n3. **Endpoints**\n\n<CodeBlock title="user.yml">\n```yaml\nservice:\n  base-path: /users\n  auth: false\n  endpoints: {}\n```\n</CodeBlock>\n\n## Endpoints\n\nAn endpoint includes:\n\n- A **URL path** (optionally including path parameters)\n- An **HTTP Method**\n- **Request information** _(Optional)_\n  - **Query-parameters**\n  - **Headers**\n  - **Request body**\n- **Successful (200) response** information _(Optional)_\n- **Error (non-200) responses** that this endpoint might return _(Optional)_\n\n## URL Path\n\nEach endpoint has a URL path.\n\n<CodeBlock title="user.yml">\n```yaml\nservice:\n  base-path: /users\n  auth: false\n  endpoints:\n    getAllUsers:\n      path: /all # <---\n      method: GET\n```\n</CodeBlock>\n\nThe full path for the endpoint is the concatenation of:\n\n- The [environment](./api-yml#environments) URL\n- The service `base-path`\n- The endpoint `path`\n\n### Path parameters\n\nYou can supply path parameters for your endpoints to create dynamic URLs.\n\n<CodeBlock title="user.yml">\n```yaml\nservice:\n  base-path: /users\n  auth: false\n  endpoints:\n    getUser:\n      path: /{userId} # <---\n      path-parameters: # <---\n        userId: string\n      method: GET\n```\n</CodeBlock>\n\nServices can also have path-parameters:\n\n<CodeBlock title="project.yml">\n```yaml\nservice:\n  base-path: /projects/{projectId}\n  path-parameters:\n    projectId: string\n  auth: false\n  endpoints: ...\n```\n</CodeBlock>\n\n## Query parameters\n\nEach endpoint can specify query parameters:\n\n\n<CodeBlock title="user.yml">\n```yaml\nservice:\n  base-path: /users\n  auth: false\n  endpoints:\n    getAllUsers:\n      path: /all\n      method: GET\n      request:\n        # this name is required for idiomatic SDKs\n        name: GetAllUsersRequest\n        query-parameters:\n          limit: optional<integer>\n```\n</CodeBlock>\n\n### `allow-multiple`\n\nYou can use `allow-multiple` to specify that a query parameter is allowed\nmultiple times in the URL, e.g., `?filter=jane&filter=smith`. This will alter\nthe generated SDKs so that consumers can provide multiple values for the query\nparameter.\n\n<CodeBlock title="user.yml">\n```yaml\nquery-parameters:\n  filter:\n    type: string\n    allow-multiple: true # <---\n```\n</CodeBlock>\n\n## Auth\n\nEach endpoint can override the auth behavior specified in the service.\n\n<CodeBlock title="user.yml">\n```yaml\nservice:\n  base-path: /users\n  auth: false\n  endpoints:\n    getMe:\n      path: ""\n      method: GET\n      # This endpoint will be authed\n      auth: true\n      docs: Return the current user based on Authorization header.\n```\n</CodeBlock>\n\n## Headers\n\nEach endpoint can specify request headers:\n\n<CodeBlock title="user.yml">\n```yaml\nservice:\n  base-path: /users\n  auth: false\n  endpoints:\n    getAllUsers:\n      path: /all\n      method: GET\n      request:\n        # this name is required for idiomatic SDKs\n        name: GetAllUsersRequest\n        headers:\n          X-Endpoint-Header: string\n```\n</CodeBlock>\n\nServices can also specify request headers. These headers will cascade to the service\'s endpoints.\n\n<CodeBlock title="user.yml">\n```diff\n service:\n   base-path: /users\n   auth: false\n+    headers:\n+      X-Service-Header: string\n   endpoints:\n     getAllUsers:\n       path: /all\n       method: GET\n       request:\n         # this name is required for idiomatic SDKs\n         name: GetAllUsersRequest\n         headers:\n           X-Endpoint-Header: string\n```\n</CodeBlock>\n\n## Request body\n\nEndpoints can specify a request body type.\n\n<CodeBlock title="user.yml">\n```yaml\nservice:\n  base-path: /users\n  auth: false\n  endpoints:\n    setUserName:\n      path: /{userId}/set-name\n      path-parameters:\n        userId: string\n      method: POST\n      request: string # <---\n```\n</CodeBlock>\n\n### Inlining a request body\n\nIf the request body is an object, you can **inline the type declaration.** This\nmakes the generated SDKs a bit more idiomatic.\n\n<CodeBlock title="user.yml">\n```yaml\nservice:\n  base-path: /users\n  auth: false\n  endpoints:\n    createUser:\n      path: /create\n      method: POST\n      request:\n        # this name is required for idiomatic SDKs\n        name: CreateUserRequest\n        body:\n          properties:\n            userName: string\n```\n</CodeBlock>\n\n## Multipart form uploads\n\nIf the request involves uploading a file, use the `file` type\nin your request body.\n\n<CodeBlock title="document.yml">\n```yaml\nservice:\n  base-path: /documents\n  auth: false\n  endpoints:\n    uploadDocument:\n      path: /upload\n      method: POST\n      request:\n        name: UploadDocumentRequest\n        body:\n          properties:\n            file: file # <------ \n```\n</CodeBlock>\n\n## Success response\n\nEndpoints can specify a `response`, which is the type of the body that will be\nreturned on a successful (200) call.\n\n<CodeBlock title="user.yml">\n```yaml\nservice:\n  base-path: /users\n  auth: false\n  endpoints:\n    getAllUsers:\n      path: /all\n      method: GET\n      response: list<User>\n\ntypes:\n  User:\n    properties:\n      userId: string\n      name: string\n```\n</CodeBlock>\n\n## Error responses\n\nEndpoints can specify error responses, which detail the non-200 responses that\nthe endpoint might return\n\n<CodeBlock title="user.yml">\n```yaml\nservice:\n  base-path: /users\n  auth: false\n  endpoints:\n    getUser:\n      path: /{userId}\n      path-parameters:\n        userId: string\n      method: GET\n      response: User\n      errors:\n        - UserNotFoundError\n\ntypes:\n  User:\n    properties:\n      userId: string\n      name: string\n\nerrors:\n  UserNotFoundError:\n    status-code: 404\n```\n</CodeBlock>\n\nYou can learn more about how to define errors on the [Errors](./errors) page.\n\n## Specifying examples\n\nWhen you declare an example, you can also specify some examples of how that\nendpoint might be used. These are used by the compiler to enhance the generated\noutputs. Examples will show up as comments in your SDKs, API documentation, and Postman collection.\n\nYou may add examples for endpoints, types, and errors.\n\n<CodeBlock title="user.yml">\n```yaml\nservice:\n  base-path: /users\n  auth: false\n  endpoints:\n    getUser:\n      path: /{userId}\n      path-parameters:\n        userId: string\n      method: GET\n      response: User\n      errors:\n        - UserNotFoundError\n      examples: # <---\n        - path-parameters:\n            userId: alice-user-id\n          response:\n            body:\n              userId: alice-user-id\n              name: Alice\n\ntypes:\n  User:\n    properties:\n      userId: string\n      name: string\n\nerrors:\n  UserNotFoundError:\n    status-code: 404\n```\n</CodeBlock>\n\nIf you\'re adding an example to an endpoint and the type already has an example, you can reference it using `$`.\n\n```yaml\nservice:\n  auth: true\n  base-path: /address\n  endpoints:\n    create:\n      method: POST\n      path: ""\n      request: CreateAddress\n      response: Address\n      examples:\n        - request: $CreateAddress.WhiteHouse\n          response:\n            body: $Address.WhiteHouseWithID\n\n  CreateAddress:\n    properties:\n      street1: string\n      street2: optional<string>\n      city: string\n      state: string\n      postalCode: string\n      country: string\n      isResidential: boolean\n    examples:\n      - name: WhiteHouse\n        value:\n          street1: 1600 Pennsylvania Avenue NW\n          city: Washington DC\n          state: Washington DC\n          postalCode: "20500"\n          country: US\n          isResidential: true\n\n  Address:\n    extends: CreateAddress\n    properties:\n      id:\n        type: uuid\n        docs: The unique identifier for the address.\n    examples:\n      - name: WhiteHouseWithID\n        value:\n          id: 65ce514c-41e3-11ee-be56-0242ac120002\n          street1: 1600 Pennsylvania Avenue NW\n          city: Washington DC\n          state: Washington DC\n          postalCode: "20500"\n          country: US\n          isResidential: true\n```\n\nExamples contain all the information about the endpoint call, including\nthe request body, path paramters, query parameters, headers, and response body.\n\n\n<CodeBlock title="user.yml">\n```yaml\nexamples:\n  - path-parameters:\n      userId: some-user-id\n    query-parameters:\n      limit: 50\n    headers:\n      X-My-Header: some-value\n    response:\n      body:\n        response-field: hello\n```\n</CodeBlock>\n\n### Failed examples\n\nYou can also specify examples of failed endpoints calls. Add the `error`\nproperty to a response example to designate which failure you\'re demonstrating.\n\n<CodeBlock title="user.yml">\n```yaml\nexamples:\n  - path-parameters:\n      userId: missing-user-id\n    response:\n      error: UserNotFoundError # <--\n\nerrors:\n  UserNotFoundError:\n    status-code: 404\n```\n</CodeBlock>\n\nIf the error has a body, then you must include the body in the example.\n\n<CodeBlock title="user.yml">\n```yaml\nexamples:\n  - path-parameters:\n      userId: missing-user-id\n    response:\n      error: UserNotFoundError\n      body: "User with id `missing-user-id` was not found" # <--\n\nerrors:\n  UserNotFoundError:\n    status-code: 404\n    type: string # <--\n```\n</CodeBlock>\n\n### Referencing examples from types\n\nTo avoid duplication, you can reference examples from types using `$`.\n\n<CodeBlock title="user.yml">\n```yaml\nservice:\n  base-path: /users\n  auth: true\n  endpoints:\n    getUser:\n      method: GET\n      path: /{userId}\n      path-parameters:\n        userId: UserId\n      examples:\n        - path-parameters:\n            userId: $UserId.Example1 # <---\n\ntypes:\n  UserId:\n    type: integer\n    examples:\n      - name: Example1\n        value: user-id-123\n```\n</CodeBlock>\n',
                },
                "pages/fern-definition/errors.mdx": {
                    markdown:
                        'Errors represent failed (non-200) responses from endpoints.\n\nAn error has:\n\n- An HTTP status code\n- A body type _(Optional)_\n\n<CodeBlock title="user.yml">\n```yaml\nerrors:\n  UserNotFoundError:\n    status-code: 404\n    type: UserNotFoundErrorBody\n\ntypes:\n  UserNotFoundErrorBody:\n    properties:\n      requestedUserId: string\n```\n</CodeBlock>',
                },
                "pages/fern-definition/imports.mdx": {
                    markdown:
                        'Imports allow you to reference types and errors from other files\n\n<CodeBlock title="persion.yml">\n```yaml\ntypes:\n  Person: ...\n```\n</CodeBlock>\n\n<CodeBlock title="family.yml">\n```yaml\nimports:\n  person: ./path/to/person.yml\ntypes:\n  Family:\n    properties:\n      people: list<person.Person> # use an imported type\n```\n</CodeBlock>\n\nNote that you can only import files that exist in your Fern Definition (i.e., in the same `definition/` folder).\n',
                },
                "pages/fern-definition/api-yml.mdx": {
                    markdown:
                        'Every Fern API has a special file called `api.yml`, which includes all the API-wide configuration.\n\n```yaml\nfern/\n├─ fern.config.json\n└─ api/\n  ├─ generators.yml\n  └─ definition/\n    ├─ api.yml # <---\n    └─ imdb.yml\n```\n\n## API name\n\nThis name is used to uniquely identify your API in your organization. If you\njust have one API, then `api` is a sufficient name.\n\n<CodeBlock title="api.yml">\n```yaml\nname: api\n```\n</CodeBlock>\n\n## API docs\n\nYou can define top level API docs. These docs will come through in the\nOpenAPI spec and Postman collection.\n\n<CodeBlock title="api.yml">\n```yaml\nname: api\ndocs: |\n  ## Header\n  This API provides access to...\n```\n</CodeBlock>\n\n## Authentication\n\nYou can specify the authentication scheme used by your API.\n\nOut of the box, Fern supports `Bearer` and `Basic` authentication schemes.\n\n<CodeBlock title="api.yml">\n```yaml\nname: api\nauth: bearer\n```\n</CodeBlock>\n\n<CodeBlock title="api.yml">\n```yaml\nname: api\nauth: basic\n```\n</CodeBlock>\n\nYou can also create your own authentication schemes.\n\n<CodeBlock title="api.yml">\n```yaml\nname: api\nauth: MyAuthScheme\nauth-schemes:\n  MyAuthScheme:\n    header: X-API-Key\n    type: string\n```\n</CodeBlock>\n\n## API-wide headers\n\nYou can specify headers that are meant to be included on every request:\n\n<CodeBlock title="api.yml">\n```yaml\nname: api\nheaders:\n  X-App-Id: string\n```\n</CodeBlock>\n\n## Environments\n\nYou can specify the environments where your backend is deployed. These are useful\nin most generated outputs, like SDKs and in Postman Collections.\n\n<CodeBlock title="api.yml">\n```yaml\nname: api\nenvironments:\n  Production: https://www.yoursite.com\n  Staging:\n    docs: This staging environment is helpful for testing!\n    url: https://www.staging.yoursite.com\n```\n</CodeBlock>\n\nYou can also provide a default environment:\n\n<CodeBlock title="api.yml">\n```yaml\nname: api\nenvironments:\n  Production: https://www.yoursite.com\n    Staging:\n      docs: This staging environment is helpful for testing!\n      url: https://www.staging.yoursite.com\ndefault-environment: Production\n```\n</CodeBlock>\n\n### Multiple URLs per environment\n\nYou can specify multiple URLs per environment. This is helpful if you have a\nmicroservice architecture, and you want a single SDK to interact with multiple\nservers.\n\n<CodeBlock title="api.yml">\n```yaml\nenvironments:\n  Production:\n    urls:\n      Auth: https://auth.yoursite.com\n      Plants: https://plants.yoursite.com\n  Staging:\n    urls:\n      Auth: https://auth.staging.yoursite.com\n      Plants: https://plants.staging.yoursite.com\n```\n</CodeBlock>\n\nIf you choose to use this feature, you must specify a `url` for each service you define:\n\n<CodeBlock title="auth.yml">\n```yaml\nservice:\n  url: Auth\n  base-path: /auth\n  ...\n```\n</CodeBlock>\n\n## Error discrimination strategy\n\nIn order to generate SDKs idiomatically, Fern needs to know how to differentiate\nbetween different errors when parsing an endpoint response.\n\n### Discriminate by status code\n\nYou can specify Fern to discriminate by status code. This means on each\nendpoint, every error that\'s listed must have a different HTTP status code.\n\n<CodeBlock title="api.yml">\n```yaml\nname: api\nerror-discrimination:\n  strategy: status-code\n```\n</CodeBlock>\n\n### Discriminate by error name\n\nYou can specify Fern to discriminate by error name. If you select this strategy,\nthen Fern will assume that every error response has an extra property denoting\nthe error name.\n\nIf you use Fern to generate server-side code, then this option provides\nthe most flexibility. Otherwise, you\'ll probably want to use the status code\ndiscrimination strategy.\n\n<CodeBlock title="api.yml">\n```yaml\nname: api\nerror-discrimination:\n  strategy: property\n  property-name: errorName\n```\n</CodeBlock>\n\n## API-wide errors\n\nYou can import and list errors that will be thrown by every endpoint.\n\n<CodeBlock title="api.yml">\n```yaml\nimports:\n  commons: commons.yml\n\nerrors:\n  - commons.NotFoundError\n  - commons.BadRequestError\n```\n</CodeBlock>\n',
                },
                "pages/fern-definition/packages.mdx": {
                    markdown:
                        '## What is a package?\n\nEvery folder in your API definition is a package.\n\n```yaml\nfern/\n├─ fern.config.json\n└─ api/\n  ├─ generators.yml\n  └─ definition/ # <------ root package\n    ├─ api.yml\n    ├─ imdb.yml\n    └─ persons/ # <-------- nested package\n      ├─ director.yml\n```\n\nThe generated SDK will match the hierarchy of your API definition.\n\n```ts\nconst client = new Client();\n\n// calling endpoint defined in imdb.yml\nclient.imdb.getRating("goodwill-hunting");\n\n// calling endpoint defined in persons/director.yml\nclient.persons.director.get("christopher-nolan");\n```\n\n## Package Configuration\n\nEach package can have a special file called `__package__.yml`. Just like any\nother definition file, it can contain [imports](imports),\n[types](types), [endpoints](endpoints), and [errors](errors).\n\nEndpoints in `__package__.yml` will appear at the root of the package.\nFor example, the following generated SDK\n\n```ts\nconst client = new Client();\n\nclient.submitRating("goodwill-hunting", 9.5);\n```\n\nwould have a fern directory\n\n```yaml\nfern/\n├─ fern.config.json\n└─ api/\n  ├─ generators.yml\n  └─ definition/\n    ├─ __package__.yml # <---\n    └─ api.yml\n```\n\nthat contains the following `__package__.yml`\n\n<CodeBlock title="__package__.yml">\n```yaml \nservice:\n  base-path: ""\n  auth: true\n  endpoints:\n    submitRating:\n      method: POST\n      path: "/submit-rating/{movieId}"\n      path-parameters:\n        movieId: string\n      request:\n        type: double\n        docs: Rating of the movie\n```\n</CodeBlock>\n\n## Namespacing\n\nEach package has its own namespace. This means you can reuse type names and\nerror names across packages.\n\nThis is useful when versioning your APIs. For example, when you want to\nincrement your API version you can just copy the existing API\nto a new package and start making changes. If the new API version reuses\ncertain types or errors, that\'s okay because the two APIs live in different\npackagess.\n\n```yaml\nfern/\n├─ fern.config.json\n└─ api/\n  ├─ generators.yml\n  └─ definition/\n    ├─ api.yml\n    └─ imdb/\n        └─ v1/\n          └─ movie.yml # type names can overlap with v2/movie.yml\n        └─ v2/\n          └─ movie.yml\n```\n',
                },
                "pages/sdks/node-sdk.mdx": {
                    markdown:
                        '[Source code](https://github.com/fern-api/fern-typescript)\n\n**Latest version**: `0.7.2`\n\nThe TypeScript Node.js SDK generator outputs a fully functional TypeScript/JavaScript SDK for server-side usage. It can publish the SDK to npmjs.org (or any other npm repository).\n\n## Local\n\nDump the generated SDK to the local file system. Available on the open source plan.\n\n<CodeBlock title="generators.yml">\n```yaml\ngenerators:\n  groups:\n    local:\n      - name: fernapi/fern-typescript-node-sdk\n        version: 0.7.2\n        output:\n          location: local-file-system\n          path: ../../generated/sdk/node\n```\n</CodeBlock>\n\n## Publish an Internal Package\n\nPublish the generated SDK to a private NPM hosted by Fern. Available on the Starter plan.\n\n<CodeBlock title="generators.yml">\n```yaml\ngenerators:\n  groups:\n    internal:\n      - name: fernapi/fern-typescript-node-sdk\n        version: 0.7.2\n        output:\n          location: npm.buildwithfern.com\n          package-name: @fern-imdb/api # replace imdb with your org name\n```\n</CodeBlock>\n\n## Publish a Public Package\n\nPublish the generated SDK to [npmjs.com](https://www.npmjs.com/). Available on the Starter plan.\n\n<CodeBlock title="generators.yml">\n```yaml\ngenerators:\n  groups:\n    public:\n      - name: fernapi/fern-typescript-node-sdk\n        version: 0.7.2\n        output:\n          location: npm\n          package-name: imdb # replace with your package name\n          token: ${NPM_TOKEN}\n        github:\n          repository: imdb/imdb-node # replace imdb with your org & package name\n```\n</CodeBlock>\n\nYou can override the registry using the `url` key.\n\n<CodeBlock title="generators.yml">\n```diff\ngenerators:\n  groups:\n    public:\n      - name: fernapi/fern-typescript-node-sdk\n        version: 0.7.2\n        output:\n          location: npm\n          package-name: imdb # replace with your package name\n          token: ${NPM_TOKEN}\n+       url: your-npm-registry.com\n```\n</CodeBlock>\n\n## Configuration options\n\nYou can customize the behavior of the TypeScript generator in `generators.yml`. \n\nYou can have one or many config, such as:\n\n<CodeBlock title="generators.yml">\n```diff\n- name: fernapi/fern-typescript-node-sdk\n  version: 0.7.2\n  output:\n    location: npm\n    package-name: imdb\n  github:\n    repository: imdb/imdb-node \n+ config: \n+   namespaceExport: IMDb\n+   timeoutInSeconds: 120\n+   noSerdeLayer: true\n+   outputEsm: true\n```\n</CodeBlock>\n\nThe following options are available:\n\n### Namespace Export\n\n- `namespaceExport`: Allows you to control the name of the generated namespace export and client class. By default, the exported namespace and client are named based on the organization and API names in the Fern Definition.\n\n**Type**: string\n\n```\nimport { IMDbApi, IMDbApiClient } from "imdb";\n```\n\nTo customize these names, you can use `namepaceExport`:\n\n<CodeBlock title="generators.yml">\n```diff\n- name: fernapi/fern-typescript-node-sdk\n  version: 0.7.2\n  output:\n    location: npm\n    package-name: imdb\n  github:\n    repository: imdb/imdb-node \n+ config: \n+   namespaceExport: IMDb\n```\n</CodeBlock>\n\nThe result would be:\n\n```\nimport { IMDb, IMDbClient } from "imdb";\n```\n\n### Timeout\n\n- `timeoutInSeconds`: Allows you to control the timeout of the generated client. The timeout is measured in seconds. This is useful for long running operations. Set to infinity to disable timeouts.\n\n**Type**: integer or "infinity"\n**Default**: `60`\n\n```yaml \nconfig: \n  timeoutInSeconds: 120\n```\n\n```yaml \nconfig: \n  timeoutInSeconds: infinity\n```\n\n### No Serde Layer\n\n- `noSerdeLayer`: Allows you to control whether (de-)serialization code is generated. When `true`, the client uses JSON.parse() and JSON.stringify() instead.\n\n**Type**: `boolean`\n**Default**: `false`\n\nBy default, the generated client includes a layer for serializing requests and deserializing responses. This has three benefits:\n\n1. The client validates requests and response at runtime, client-side.\n\n1. The client can support complex types, like `Date` and `Set`.\n\n1. The generated types can stray from the wire/JSON representation to be more idiomatic. For example, when `noSerdeLayer` is disabled, all properties are camelCase, even if the server is expecting snake_case.\n\n```yaml\nconfig: \n  noSerdeLayer: true\n```\n\n### Output ESM \n\n- `outputEsm`: Allows you to control whether (de-)serialization code is generated. When `true`, the client uses JSON.parse() and JSON.stringify() instead.\n\n**Type**: `boolean`\n**Default**: `false` \n\nBy default, the generated TypeScript targets CommonJS. Set `outputEsm` to `true` to target `esnext` instead.\n\n```yaml\nconfig: \n  outputEsm: true\n```\n\n### Output Source Files \n\n- `outputSourceFiles`: Allows you to control whether the generator outputs `.js` and `d.ts` files. \n\n**Type**: `boolean`\n**Default**: `false` \n\nWhen enabled, the generator outputs raw TypeScript files.\n\nWhen disabled (the default), the generator outputs .js and d.ts files.\n\n<Callout intent="warn">\nThis config only applied when dumping the generated SDK to the local file system. It does not apply when publishing to GitHub or npm.\n</Callout>\n\n```yaml\nconfig: \n  outputSourceFiles: true\n```\n\n### Include Credentials On Cross Origin Requests \n\n- `includeCredentialsOnCrossOriginRequests`: Allows you to set [withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials)  to `true` when making network requests.\n\n**Type**: `boolean`\n**Default**: `false` \n\n```yaml\nconfig: \n  includeCredentialsOnCrossOriginRequests: true\n```\n\n### allowCustomFetcher\n\n- `allowCustomFetcher`: Allows the end user to specify a custom fetcher implementation. \n\n**Type**: `boolean`\n**Default**: `false` \n\n```yaml\nconfig: \n  allowCustomFetcher: true\n```\n\n```typescript\nconst imdb = new IMDbClient({\n  fetcher: (args) => {\n    ...\n  },\n});\n```\n\n### Require Default Environment\n\n- `requireDefaultEnvironment`: When enabled, the generated client doesn\'t allow the user to specify a server URL.\n\n**Type**: `boolean`\n**Default**: `false` \n\n```yaml\nconfig: \n  requireDefaultEnvironment: true\n```\n\nWhen disabled (the default), the generated client includes an option to override the server URL:\n\n```typescript\nconst imdb = new IMDbClient({\n  environment: "localhost:8080",\n});\n```\n\n### Skip Response Validation\n\n- `skipResponseValidation`: When enabled, the generated client will never throw if the response is misshapen. Rather, the client will log the issue using `console.warn` and return the data (casted to the expected response type).\n\n**Type**: `boolean`\n**Default**: `false` \n\nBy default, the client will throw an error if the response from the server doesn\'t match the expected type (based on how the response is modeled in the API definition).\n\n```yaml\nconfig: \n  skipResponseValidation: true\n```\n\n### Extra Dependencies\n\n- `extraDependencies`: When enabled, the generated client will never throw if the response is misshapen. Rather, the client will log the issue using `console.warn` and return the data (casted to the expected response type).\n\n**Type**: `map<string,string>`\n**Default**: `{}`\n\n<Callout intent="warn">\nThis only applies when publishing to GitHub.\n</Callout>\n\nBy default, the client will throw an error if the response from the server doesn\'t match the expected type (based on how the response is modeled in the API definition).\n\n```yaml\nconfig: \n  extraDependencies: \n    jest: "^29.7.0" # <-- examples\n    "@types/jest": "^29.5.5"\n    ts-jest: "^29.1.1"\n```\n\n### Treat Unknown As Any\n\n- `treatUnknownAsAny`: When enabled, unknown types from Fern are generated into TypeScript using `any`.\n\n**Type**: `boolean`\n**Default**: `false`\n\nIn Fern, there\'s an `unknown` type that represents data that isn\'t knowable at runtime. By default, these types are generated into TypeScript as the `unknown` type.\n\n```yaml\nconfig: \n  treatUnknownAsAny: true\n```\n\n### No Optional Properties \n\n- `noOptionalProperties`: When enabled,  the generated properties are never optional. Instead, the type is generated with `| undefined`.\n\n**Type**: `boolean`\n**Default**: `false`\n\nFor example, let\'s say you have the following Fern Definition:\n\n<CodeBlock title="person.yml">\n```yaml\ntypes:\n  Person:\n    properties:\n      name: string\n      age: optional<integer>\n```\n</CodeBlock>\n\nBy default, Fern\'s `optional<>` properties will translate to optional TypeScript properties:\n\n```typescript\ninterface Person {\n  name: string;\n  age?: number;\n}\n```\n\nWhen `noOptionalProperties` is enabled (set to `true`):\n\n```typescript\ninterface Person {\n  name: string;\n  age: number | undefined;\n}\n```\n\n### Use Branded String Aliases\n\n- `useBrandedStringAliases`: When enabled, string aliases are generated as branded strings. This makes each alias feel like its own type and improves compile-time safety.\n\n**Type**: `boolean`\n**Default**: `false`\n\nFor example, let\'s say you have the following Fern Definition:\n\n<CodeBlock title="movies.yml">\n```yaml\ntypes:\n  MyString: string\n  OtherString: string\n```\n</CodeBlock>\n\n<CodeBlock title="generated code">\n```typescript\nexport type MyString = string & { __MyString: void };\nexport const MyString = (value: string): MyString => value as MyString;\n\nexport type OtherString = string & { __OtherString: void };\nexport const OtherString = (value: string): OtherString => value as OtherString;\n```\n</CodeBlock>\n\n<CodeBlock title="consuming the generated type">\n```typescript\nfunction printMyString(s: MyString): void {\n  console.log("MyString: " + s);\n}\n\n// doesn\'t compile, "foo" is not assignable to MyString\nprintMyString("foo");\n\nconst otherString = OtherString("other-string");\n// doesn\'t compile, otherString is not assignable to MyString\nprintMyString(otherString);\n\n// compiles\nconst myString = MyString("my-string");\nprintMyString(myString);\n```\n</CodeBlock>\n\nWhen `useBrandedStringAliases` is disabled (the default), string aliases are generated as normal TypeScript aliases:\n\n<CodeBlock title="generated code">\n```typescript\nexport type MyString = string;\n\nexport type OtherString = string;\n```\n</CodeBlock>\n\n### Never Throw Errors\n\n- `neverThrowErrors`: When enabled, the client doesn\'t throw errors when a non-200 response is received from the server. Instead, the response is wrapped in an [ApiResponse](https://github.com/fern-api/fern-typescript/blob/main/packages/core-utilities/fetcher/src/APIResponse.ts).\n\n**Type**: `boolean`\n**Default**: `false`\n\n<CodeBlock title="APIResponse.ts">\n```typescript\nconst response = await client.callEndpoint(...);\nif (response.ok) {\n  console.log(response.body)\n} else {\n  console.error(respons.error)\n}\n```\n</CodeBlock>\n\n',
                },
                "pages/sdks/browser-sdk.mdx": {
                    markdown:
                        '[Source code](https://github.com/fern-api/fern-typescript)\n\n**Latest version**: `0.7.2`\n\nThe TypeScript Browser SDK generator outputs a fully functional TypeScript/JavaScript\nSDK for usage in the browser. It can publish the SDK to npmjs.org (or any other npm repository).\n\n## Local\n\n<CodeBlock title="generators.yml">\n```yaml\ngenerators:\n  groups:\n    local:\n      - name: fernapi/fern-typescript-browser-sdk\n        version: 0.7.2\n        output:\n          location: local-file-system\n          path: ../../generated/sdk/browser\n```\n</CodeBlock>\n\n## Publish an Internal Package\n\nPublish the generated SDK to a private NPM hosted by Fern. Available on the Starter plan.\n\n<CodeBlock title="generators.yml">\n```yaml\ngenerators:\n  groups:\n    internal:\n      - name: fernapi/fern-typescript-browser-sdk\n        version: 0.7.2\n        output:\n          location: npm.buildwithfern.com\n          package-name: "@fern-imdb/api" # replace imdb with your org name\n```\n</CodeBlock>\n\n## Publish a Public Package\n\n<CodeBlock title="generators.yml">\n```yaml\ngenerators:\n  groups:\n    public:\n      - name: fernapi/fern-typescript-browser-sdk\n        version: 0.7.2\n        output:\n          location: npm\n          package-name: imdb-browser # replace imdb with your package name\n        github:\n          repository: imdb/imdb-browser # replace imdb with your org & package name\n```\n</CodeBlock>\n\n## Configuration options\n\nYou can customize the behavior of the TypeScript Browser generator in `generators.yml`. [View the options available](https://docs.buildwithfern.com/sdks/typescript-node) which are the same as the options for the TypeScript Node generator.',
                },
                "pages/sdks/python-sdk.mdx": {
                    markdown:
                        '[Source code](https://github.com/fern-api/fern-python)\n\n**Latest version**: `0.6.2`\n\nThe Python SDK generator outputs a fully functional Python\nSDK. It can publish the SDK to [pypi.org](pypi.org) (or any other PyPI repository).\n\n## Local\n\nDump the generated SDK to the local file system. Available on the open source plan.\n\n<CodeBlock title="generators.yml">\n```yaml\ngenerators:\n  groups:\n    local:\n      - name: fernapi/fern-python-sdk\n        version: 0.6.2\n        output:\n          location: local-file-system\n          path: ../../generated/sdk/python\n```\n</CodeBlock>\n\n## Publish an Internal Package\n\nPublish the generated SDK to a private PyPI repository hosted by Fern. Available on the Starter plan.\n\n<CodeBlock title="generators.yml">\n```yaml\ngenerators:\n  groups:\n    internal:\n      - name: fernapi/fern-python-sdk\n        version: 0.6.2\n        output:\n          location: pypi.buildwithfern.com\n          package-name: imdb # replace with your package name\n```\n</CodeBlock>\n\n## Publish a Public Package\n\nPublish the generated SDK to PyPI. Available on the Starter plan.\n\n<CodeBlock title="generators.yml">\n```yaml\ngenerators:\n  groups:\n    public:\n      - name: fernapi/fern-python-sdk\n        version: 0.6.2\n        output:\n          location: pypi\n          package-name: imdb\n          token: ${PYPI_TOKEN}\n        github:\n          repository: imdb/imdb-python    \n```\n</CodeBlock>',
                },
                "pages/sdks/java-sdk.mdx": {
                    markdown:
                        '[Source code](https://github.com/fern-api/fern-java)\n\n**Latest version**: `0.5.13`\n\nThe Java SDK generator outputs a fully functional Java\nSDK. It can publish the SDK to Maven Central (or any other Maven repository).\n\n## Local\n\nDump the generated SDK to the local file system. Available on the open source plan.\n\n<CodeBlock title="generators.yml">\n```yaml\ngenerators:\n  groups:\n    local:\n      - name: fernapi/fern-java-sdk\n        version: 0.5.13\n        output:\n          location: local-file-system\n          path: ../../generated/sdk/java\n```\n</CodeBlock>\n\n## Publish an Internal Package\n\nPublish the generated SDK to a private Maven repository hosted by Fern. Available on the Starter plan.\n\n<CodeBlock title="generators.yml">\n```yaml\ngenerators:\n  groups:\n    internal:\n      - name: fernapi/fern-java-sdk\n        version: 0.5.13\n        output:\n          location: npm.buildwithfern.com\n          package-name: @fern-imdb/api # replace with your package name\n```\n</CodeBlock>\n\n## Publish a Public Package\n\nPublish the generated SDK to Maven Central. Available on the Starter plan.\n\n<CodeBlock title="generators.yml">\n```yaml\ngenerators:\n  groups:\n    public:\n      - name: fernapi/fern-java-sdk\n        version: 0.5.13\n        output:\n          location: maven\n          # replace with your coordinate\n          # e.g., com.example.my-api:my-api\n          coordinate: io.github.imdb:imdb \n          username: ${MAVEN_USERNAME}\n          password: ${MAVEN_PASSWORD}\n        github:\n          repository: imdb/imdb-java # replace imdb your organization     \n```\n</CodeBlock>',
                },
                "pages/sdks/go-sdk.mdx": {
                    markdown:
                        '[Source code](https://github.com/fern-api/fern-go)\n\n**Latest version**: `0.9.0`\n\nThe Go SDK generator outputs a fully functional Go SDK.\n\n## Local\n\nDump the generated SDK to the local file system. Available on the open source plan.\n\n<CodeBlock title="generators.yml">\n```yaml\ngenerators:\n  groups:\n    local:\n      - name: fernapi/fern-go-sdk\n        version: 0.9.0\n        output:\n          location: local-file-system\n          path: ../../generated/sdk/go\n```\n</CodeBlock>\n\n## Publish to GitHub \n\nPublish the generated SDK to GitHub.\n\n<CodeBlock title="generators.yml">\n```yaml\ngenerators:\n  groups:\n    publish:\n      - name: fernapi/fern-go-sdk\n        version: 0.9.0\n        github:\n          repository: fern-imdb/imdb-go # replace imdb with your organization\n```\n</CodeBlock>\n',
                },
                "pages/sdks/ruby-sdk.mdx": {
                    markdown:
                        '[Source code](https://github.com/fern-api/fern-ruby)\n\nLatest version: `0.0.0`\n\n<Callout intent = "tip">\nComing by the end of the year! \n</Callout>\n\n<br />\n\nThe Ruby SDK generator outputs a fully functional Ruby\nSDK. It can publish the SDK to [RubyGems.org](RubyGems.org).\n\n<CodeBlock title="generators.yml">\n```yaml\n- name: fernapi/fern-ruby-sdk\n  version: 0.0.0\n```\n</CodeBlock>\n',
                },
                "pages/sdks/csharp-sdk.mdx": {
                    markdown:
                        '[Source code](https://github.com/fern-api/fern-csharp)\n\nLatest version: `0.0.0`\n\n<Callout intent = "tip">\nComing by the end of the year! \n</Callout>\n\n<br />\n\nThe C# SDK generator outputs a fully functional C#\nSDK. It can publish the SDK to [NuGet.org](https://www.nuget.org).\n\n<CodeBlock title="generators.yml">\n```yaml\n- name: fernapi/fern-csharp-sdk\n  version: 0.0.0\n```\n</CodeBlock>\n',
                },
                "pages/sdks/php-sdk.mdx": {
                    markdown:
                        '[Source code](https://github.com/fern-api/fern-php)\n\nLatest version: `0.0.0`\n\n<Callout intent = "tip">\nComing in 2024!\n</Callout>\n\n<br />\n\nThe PHP SDK generator outputs a fully functional PHP\nSDK. It can publish the SDK to [Packagist.org](Packagist.org).\n\n<CodeBlock title="generators.yml">\n```yaml\n- name: fernapi/fern-php-sdk\n  version: 0.0.0\n```\n</CodeBlock>\n',
                },
                "pages/docs/configuration.mdx": {
                    markdown:
                        'Every Fern Docs website has a special configuation file called `docs.yml`.\n\n<CodeBlock title = "docs.yml">\n```yaml\ntitle: Example | Docs\nnavigation:\n  - section: Home\n    contents:\n      - page: Introduction\n        path: ./intro.mdx\n      - page: Authentication\n        path: ./auth.mdx\n  - api: API Reference\nnavbar-links:\n  - type: secondary\n    text: Contact support\n    url: https://example.com/support\n  - type: primary\n    text: Login\n    url: https://example.com/login\ncolors:\n  accentPrimary: "#a6d388"\nlogo:\n  path: ./images/logo.png\n  height: 60\n  href: https://example.com\nfavicon: ./images/favicon.png\n```\n</CodeBlock>\n\n### Title \n\nThe `<title>` tag defines the title of the document. The title must be text-only, and is shown within the browser\'s tab. The content of a page title is important for search engine optimization (SEO). [Read more.](https://www.w3schools.com/tags/tag_title.asp)\n\n### Navigation\n\nThe navigation organizes your documentation in the left-side nav bar. Each section has a title and a list of contents. Contents contain a page name and a file path. The supported file types are `.md` or `.mdx`.\n\nLet\'s look at a basic navigation configuration. Here we have two sections, the first is called `Introduction` that has a single page `My Page` and the second is API Reference.\n\n<CodeBlock title="Example Navigation Config">\n```yaml\nnavigation: \n  - section: Introduction\n    contents: \n      - page: My Page\n        path: my-page.mdx\n  - api: API Reference\n```\n</CodeBlock>\n\n### API Reference\n\nA key benefit of using Fern Docs is that you get your API Reference with just one line. Add `- api: API Reference` and Fern will take care of the rest! You\'ll see your endpoints, types, and errors automatically populated from your API definition. \n\n### Navigation bar links\n\nIf you have links that you want to be easily accessible, you can specify a list of links in `navbar-links`. These links will appear as buttons in the top right of your documentation website.\n\n<CodeBlock title="docs.yml">\n```yaml\nnavbar-links:\n  - type: secondary\n    text: Contact support\n    url: https://example.com/support\n  - type: primary\n    text: Login\n    url: https://example.com/login\n```\n</CodeBlock>\n\n#### Link type\n\nA link can be `primary` or `secondary`. Primary links are designed to stand out and indicate that they are clickable with an arrow `>`. You can have one primary link.\n\n#### Link text\n\nA link has text which is displayed to the user.\n\n#### Link url\n\nA link has a URL which a user is directed to. By default, URLs open in a new browser tab.\n\nYou may want to use a trackable link in your URL. For example, if using [UTM parameters](https://en.wikipedia.org/wiki/UTM_parameters), instead of `www.example.com/login`, set the URL to `www.example.com/login?utm_source=docs&utm_medium=navbar`.\n\n### Colors\n\nYou may specify a primary accent color using the [Hexadecimal color](https://www.w3schools.com/colors/colors_hexadecimal.asp). The primary accent color is used in many places, including:\n\n- to indicate the page a user is on within the navigation\n- the background of a primary link button\n- to underline hyperlinks\n- the next and previous page navigation buttons\n\n<CodeBlock title="docs.yml">\n```yaml\ncolors:\n  accentPrimary: "#a6d388"\n```\n</CodeBlock>\n\n### Logo\n\nYou can add your logo that will display in the top left of your documentation website.\n\n<CodeBlock title="docs.yml">\n```yaml\nlogo:\n  path: ./images/logo.png\n  height: 60\n  href: https://example.com\n```\n</CodeBlock>\n\n#### Logo path\n\n`path` specifies the image file location. The supported file types are `.png` or `.svg`.\n\n#### Logo height\n\n`height` sets the logo\'s height in pixels.\n\n#### Logo href\n\n`href` provides a hyperlink for the logo, often used \nto point to the website homepage. When clicked, the user will be redirected to this link.\n\n### Favicon\n\nSpecifies the path to a favicon image, which is typically displayed in a \nbrowser tab or bookmark. Supported file types are `.png` and `.ico`.\n\n## Advanced features\n\nThe following configuration options are optional and allow you to further personalize your documentation website.\n\n### Font \n\nYou can specify a custom font for your documentation website.\n\n<CodeBlock title = "fern directory">\n```diff\n  fern/\n  ├─ fern.config.json\n  ├─ generators.yml\n  ├─ definition/ # Alternatively, you can have an OpenAPI file\n    ├─ api.yml\n    └─ imdb.yml\n+ ├─ fonts\n+   ├─ your-font-regular.woff2\n+   ├─ your-font-bold.woff2\n+   └─ another-font-regular.woff2\n```\n</CodeBlock>\n\nYou can reference the fonts in `docs.yml` by specifying the `path` to the font file. The supported file types are `.woff` and `.woff2`.\n\nThe `headingsFont` is used for the page title and section titles. The `bodyFont` is used for the body text. The `codeFont` is used for code blocks.\n\nHere\'s an example of how to specify custom fonts:\n\n<CodeBlock title = "docs.yml">\n```yaml\ntypography:\n  headingsFont:\n    path: ./fonts/Inter-Bold.woff2\n  bodyFont:\n    path: ./fonts/Inter-Regular.woff2\n  codeFont: \n    path:  ./fonts/Roboto-Mono-Regular.woff2\n```\n</CodeBlock>\n\n### Tabs\n\nWithin the navigation you can add `tabs`. Tabs are used to group content together. Let\'s add a new tab so that we can include `Help Center` content in addition to our API Reference. Each tab has a `title` and `icon`. [Browse the icons available](./components/icons) from FontAwesome.\n\n<CodeBlock title="docs.yml">\n```yaml\ntabs: \n  api: \n    display-name: API Reference\n    icon: puzzle\n  help:\n    display-name: Help Center\n    icon: home\n    \n navigation: \n  - tab: api\n    layout: \n      - section: Introduction\n          contents: \n            - page: My Page\n                path: my-page.mdx\n        - api: API Reference   \n  - tab: help\n    layout: \n      - section: Help Center\n        contents: \n          - page: Contact Us\n              path: contact-us.mdx\n```\n</CodeBlock>\n\n### Versions\n\nIf you have multiple versions of your documentation, you can introduce a dropdown version selector by specifying the versions and their availability.\n\n![A dropdown of the available versions](../images/versions.png)\n\nTo add a version, specify the `display-name` which be visible to users and `path` which is a file that must be in a folder called `versions`.\n\n<CodeBlock title="docs.yml">\n```yaml\nversions: \n  - display-name: v1.0\n      path: v1-0.yml # has to be in a `versions` folder\n  - display-name: v1.1\n      path: v1-1.yml\n```\n</CodeBlock>\n\n<CodeBlock title="versions/v1-0.yml">\n```yaml\nnavigation: \n  - section: Introduction\n    contents: \n      - page: My Page\n        path: my-page.mdx\n  - api: API Reference\n```\n</CodeBlock>\n\n<CodeBlock title="versions/v1-1.yml">\n```yaml\ntabs: \n  api: \n    title: API Reference\n    icon: puzzle\n  help:\n    title: Help Center\n    icon: home\n    \n navigation: \n  - tab: api\n     contents: \n        - section: Introduction\n           contents: \n              - page: My Page\n                 path: my-page.mdx\n        - api: API Reference   \n   - tab: help\n      contents: \n         - section: Help Center\n           contents: \n              - page: Contact Us\n                 path: contact-us.mdx\n```\n</CodeBlock>',
                },
                "pages/docs/custom-domain.mdx": {
                    markdown:
                        'Learn how to bring your own custom domain to Fern Docs.\n\n<Callout intent="tip"> \nNote: Custom domains is a paid feature. Want to get set up? \nReach out in [Discord](https://discord.com/invite/JkkXumPzcG) \nor [email us](mailto:sales@buildwithfern.com). \n</Callout>\n\n### 1. Adding your domain to `docs.yml`\n\nFirst decide what subdomain to use with your documentation. \nThe most common options are https://docs.example.com or https://example.com/docs.\n\nWe\'ll add the following to `docs.yml` to tell Fern Docs to \npublish to `example.docs.buildwithfern.com`:\n\n<CodeBlock title="docs.yml">\n```yaml\ninstances: \n  - url: example.docs.buildwithfern.com\n```\n</CodeBlock>\n\nWhen ready to publish to a custom domain, add the `custom-domain` key to the instance. Note that this is a paid feature. For example:\n\n<CodeBlock title="docs.yml">\n```diff \ninstances: \n  - url: example.docs.buildwithfern.com\n+   custom-domain: docs.example.com\n```\n</CodeBlock>\n\n### 2. Running the generator\n\nIn the example above, by running `fern generate --docs`, we\'d see:\n\n<CodeBlock title="Terminal">\n```bash\n┌─\n│ ⠂ Publish docs\n└─\n```\n</CodeBlock>\n\nfollowed by\n\n<CodeBlock title="Terminal">\n```bash\n[api]: Published docs to https://example.docs.buildwithfern.com\n┌─\n│ ✓ Publish docs\n└─\n```\n</CodeBlock>\n\n### 3. Creating DNS records to point at Fern Docs\n\nNext, you\'ll need to get the DNS records by adding Fern Docs to your subscription. \nYou can do this by reaching out [sales@buildwithfern.com](mailto:sales@buildwithfern.com).',
                },
                "pages/docs/previews.mdx": {
                    markdown:
                        "`PR previews` offer a way to preview changes from pull requests (PRs) before merging code to a production branch. This is useful for reviewing documentation changes before publishing them to your live documentation site.\n\nHere's an example of a `PR preview`: https://fern-preview-fa86d0dd-7763-4d5f-84d8-6d630dc1742a.docs.buildwithfern.com\n\n## Usage \n\n```bash\n$ fern generate --docs <instance-url> --preview\n```\n\n## Example\n\n```bash\n$ fern generate --docs fern.docs.buildwithfern.com --preview\n\nDownload @fern/registry Downloading manifest...\nDownload @fern/registry Downloading...\nDownload @fern/registry Parsing...\n[docs]: Published docs to https://fern-preview-3e0e506f-d277-4f13-be63-e609b7320db1.docs.buildwithfern.com\n┌─\n│ ✓  Download @fern/registry\n│ ✓  fern.docs.buildwithfern.com\n└─\n```\n\n## Usage in GitHub Actions  \n\nThe following is a GitHub Action workflow that generates a preview URL for every pull request.\n\n<CodeBlock title = \".github/workflows/preview-docs.yml\">\n```yaml\nname: preview-docs\n\non:\n  pull_request:\n    branches:\n      - main  \n\njobs:\n  generate-preview-docs:\n    name: Generate Documentation Preview\n    runs-on: ubuntu-latest\n\n    steps:\n      - name: Checkout repository\n        uses: actions/checkout@v4\n\n      - name: Setup Node.js\n        uses: actions/setup-node@v3\n        with:\n          node-version: '18'\n\n      - name: Install Fern\n        run: npm install -g fern-api\n\n      - name: Generate Documentation Preview with Fern\n        env:\n          FERN_TOKEN: ${{ secrets.FERN_TOKEN }}\n        run: fern generate --docs --preview\n```\n</CodeBlock>\n\n## Link expiration\n\nPreview links do not expire. However, the time to live (TTL) may be subject to change in the future.",
                },
                "pages/docs/components/card.mdx": {
                    markdown:
                        'The `Card` is used when you want to display content in a rectangular box.\n\nCard Prop:\n\n- *title*: string \n- *icon*: [Font Awesome Icon](./font-awesome.mdx)\n- *href*: string -- a link to another page\n\n## Single card \n\n<Card\ntitle="Node.js/TypeScript"\nicon="fa-brands fa-node"\nhref="https://github.com/fern-api/fern-typescript"\n/>\n\n<CodeBlock title = "single-card.mdx">\n```mdx\n    <Card\n    title="Node.js/TypeScript"\n    icon="fa-brands fa-node"\n    href="https://github.com/fern-api/fern-typescript"\n    />\n```\n</CodeBlock>\n\n## Multiple cards \n\n<Cards>\n  <Card\n    title="Node.js/TypeScript"\n    icon="fa-brands fa-node"\n    href="https://github.com/fern-api/fern-typescript"\n  />\n  <Card\n    title="Python"\n    icon="fa-brands fa-python"\n    href="https://github.com/fern-api/fern-python"\n  />\n  <Card\n    title="Java"\n    icon="fa-brands fa-java"\n    href="https://github.com/fern-api/fern-java"\n  />\n</Cards>\n\n<CodeBlock title = "multiple-cards.mdx">\n```mdx\n    <Cards>\n    <Card\n        title="Node.js/TypeScript"\n        icon="fa-brands fa-node"\n        href="https://github.com/fern-api/fern-typescript"\n    />\n    <Card\n        title="Python"\n        icon="fa-brands fa-python"\n        href="https://github.com/fern-api/fern-python"\n    />\n    <Card\n        title="Java"\n        icon="fa-brands fa-java"\n        href="https://github.com/fern-api/fern-java"\n    />\n    </Cards>\n```\n</CodeBlock>\n\n',
                },
                "pages/docs/components/callout.mdx": {
                    markdown:
                        'The `Callout Component` is used when you want to visually highlight important content for the user. There are different props available to design callout component properly.\n\nCallout Prop:\n\n**intent**: \'info\' | \'success\' | \'warn\'\n\n## Info \n\n<Callout intent="info">\nThis is an info callout. \n</Callout>\n\n<CodeBlock title = "info">\n```mdx\n<Callout intent="info">\nThis is an info callout. \n</Callout>\n```\n</CodeBlock>\n\n## Success \n\n<Callout intent="success">\nThis is a success callout. \n</Callout>\n\n<CodeBlock title = "success">\n```mdx\n<Callout intent="success">\nThis is a success callout. \n</Callout>\n```\n</CodeBlock>\n\n## Warning\n\n<Callout intent="warn">\nThis is a warn callout. \n</Callout>\n\n<CodeBlock title = "warn">\n```mdx\n<Callout intent="warn">\nThis is a warn callout. \n</Callout>\n```\n</CodeBlock>',
                },
                "pages/docs/components/icons.mdx": {
                    markdown:
                        "[Font Awesome](https://fontawesome.com/) is the Internet's icon library and toolkit, used by millions of designers, developers, and content creators. We use Font Awesome to power the icons within Fern Docs. \n\nYou can pick from the 26,000+ icons available and then apply a style, color, size, or animation to them.\n\nIf you'd like to B.Y.O.I. (Bring Your Own Icons), reach out to us at [support@buildwithfern.com](mailto:support@buildwithfern.com). This is a paid feature available on our `Business plan`.\n\n## Styling icons\n\nFont Awesome icons can be styled to really make your project look its best. You can pick icons that are avaiable under the `Pro` plan. Fern does not support the `SVG+JS` method.\n\n\n",
                },
                "pages/docs/components/availability.mdx": {
                    markdown:
                        'The `Availability Component` is used when you want to visually highlight important content for the user.\n\nAvailability Prop:\n\n**type**: \'beta\' | \'GA\' | \'deprecated\'\n\n## Beta availability \n\nIndicates that an endpoint is in <Availability type="beta" />. This means that the endpoint is still in development and may change before it is released to the public. \n\n```mdx\n<Availability type="beta" />\n```\n\n## General availability\n\nIndicates that an endpoint is <Availability type="GA" />. This means that the endpoint is ready for use in production. \n\n```mdx\n<Availability type="GA" />\n```\n\n## Deprecated availability\n\nIndicates that an endpoint is <Availability type="deprecated" />. This means that the endpoint is no longer supported and will be removed in a future release.\n\n```mdx\n<Availability type="deprecated" />\n```\n',
                },
                "pages/server-boilerplate/express.mdx": {
                    markdown:
                        'The Express generator generates types and networking logic for your Express server. This saves you time and add compile-time safety that you are serving the exact API that you specified in your API Definition.\n\n[Source code](https://github.com/fern-api/fern-typescript)\n[A starter repo for Express + React, using Fern](https://github.com/fern-api/express-starter/)\n\nAvailable on the open source plan.\n\n## What Fern generates\n\n- TypeScript interfaces for your API types\n- Exceptions that you can throw for non-200 responses\n- Interfaces for you to define your business logic\n- All the networking/HTTP logic to call your API\n\n## Adding the Express generator\n\n<CodeBlock title="generators.yml">\n```yaml\n- name: fernapi/fern-typescript-express\n  version: 0.7.2\n  output:\n    location: local-file-system\n    path: ../../generated/server-boilerplate/express\n```\n</CodeBlock>\n\n<Callout intent="warn">\nMake sure to enable `allowSyntheticDefaultImports` in your `tsconfig.json` when using this generator.\n</Callout>\n\n## Demo Video\n\n<div style={{ position: "relative", paddingBottom: "62.5%", height: "0" }}>\n    <iframe \n        src="https://www.loom.com/embed/31f4243c4d824c54938bdc4840fbb8ba?sid=e5cc10a7-0328-4813-a877-cb3cbf61ef95" \n        frameborder="0" \n        webkitallowfullscreen \n        mozallowfullscreen \n        allowfullscreen \n        style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%" }}>\n    </iframe>\n</div>\n\n\n## Express Configurations\n\nThe following options are supported when generating an Express backend:\n\n### Use Branded String Aliases\n\nSee [useBrandedStringAliases](https://docs.buildwithfern.com/sdks/typescript-node#use-branded-string-aliases) under SDK Configuration\n\n#### `treatUnknownAsAny`\n\nSee [treatUnknownAsAny](https://docs.buildwithfern.com/sdks/typescript-node#treat-unknown-as-any) under SDK Configuration\n\n#### `noSerdeLayer`\n\nSee [noSerdeLayer](https://docs.buildwithfern.com/sdks/typescript-node#no-serde-layer) under SDK Configuration\n\n#### `outputSourceFiles`\n\nSee [outputSourceFiles](https://docs.buildwithfern.com/sdks/typescript-node#output-source-files) under SDK Configuration\n\n#### `areImplementationsOptional`\n\n**Type:** boolean\n**Default:** `false`\n\nBy default, the generated `register()` will require an implementatiion for every\nservice defined in your Fern Definition.\n\nIf `areImplementationsOptional` is enabled, then `register()` won\'t require any\nimplementations. Note that this is mildly dangerous, if you forget to include\nan implementation, then your server behavior may drift from your docs and clients.\n\n#### ✨ `doNotHandleUnrecognizedErrors`\n\n**Type:** boolean\n**Default:** `false`\n\nBy default, if you throw a non-Fern error in your endpoint handler, it will be caught by generated code and a `500` response will be returned. No details from the error will be leaked to the client.\n\nIf `doNotHandleUnrecognizedErrors` is enabled and you throw a non-Fern error, the error will be caught and passed on with `next(error)`. It\'s your responsibility to set up error-catching middleware that handles the error and returns a response to the client.\n\n## Dependencies\n\nThe generated TypeScript code has the following dependencies:\n\n- [@ungap/url-search-params](https://www.npmjs.com/package/@ungap/url-search-params)\n- [url-join](https://www.npmjs.com/package/url-join)\n- [form-data](https://www.npmjs.com/package/form-data)\n- [axios](https://www.npmjs.com/package/axios)\n- [js-base64](https://www.npmjs.com/package/js-base64)\n\nIf you are packaging your code manually, make sure to include them in your `package.json`.',
                },
                "pages/server-boilerplate/fastapi.mdx": {
                    markdown:
                        'The FastAPI generator generates types and networking logic for your FastAPI server. This saves you time and add compile-time safety that you are serving the exact API that you specified in your API Definition.\n\n[Source code](https://github.com/fern-api/fern-python)\n\n[A starter repo for Express + React, using Fern](https://github.com/fern-api/fastapi-starter)\n\nAvailable on the open source plan.\n\n## What Fern generates\n\n- Pydantic models for your API types\n- Exceptions that you can throw for non-200 responses\n- Abstract classes for you to define your business logic\n- All the networking/HTTP logic to call your API\n\n## Adding the FastAPI generator\n\n<CodeBlock title="generators.yml">\n```yaml\n- name: fernapi/fern-fastapi-server\n  version: 0.6.2\n  output:\n    location: local-file-system\n    path: ../../generated/server-boilerplate/fastapi\n```\n</CodeBlock>\n\n## Example server\n\n[Venus](https://github.com/fern-api/venus) is a FastAPI  microservice in production that manages Fern\'s auth (i.e. users, organizations, tokens).\n\n## Demo Video\n\n<div style={{ position: "relative", paddingBottom: "62.5%", height: "0" }}>\n    <iframe \n        src="https://www.loom.com/embed/42de542022de4e55a1349383c7a465eb?sid=cc873e00-6c91-4a92-9b4f-7466fca4d881" \n        frameborder="0" \n        webkitallowfullscreen \n        mozallowfullscreen \n        allowfullscreen \n        style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%" }}>\n    </iframe>\n</div>\n\n## Getting started\n\nLet\'s walk through the [Fern FastAPI Starter](https://github.com/fern-api/fastapi-starter).\n\n### Step 1: Define the API\n\n<CodeBlock title = "fern/api/definition/imdb.yml">\n```yaml \nservice:\n  auth: false\n  base-path: /movies\n  endpoints:\n    getMovie:\n      method: GET\n      path: /{movieId}\n      path-parameters:\n        movieId: MovieId\n      response: Movie\n      errors:\n        - MovieDoesNotExistError\n\ntypes:\n  MovieId: string\n\n  Movie:\n    properties:\n      id: MovieId\n      title: string\n      rating:\n        type: double\n        docs: The rating scale is one to five stars\n\n  CreateMovieRequest:\n    properties:\n      title: string\n      rating: double\n\nerrors:\n  MovieDoesNotExistError:\n    status-code: 404\n    type: MovieId\n```\n</CodeBlock>\n\n### Step 2: Run `fern generate`\n\nThis generates all the boilerplate code into [generated/](https://github.com/fern-api/fastapi-starter/tree/main/backend/src/fern_fastapi_starter/api/generated).\n\n<CodeBlock title = "terminal">\n```bash\n$ fern generate\n[api]: fernapi/fern-fastapi-starter Downloaded to backend/src/fern_fastapi_starter/api/generated\n┌─\n│ ✓  fernapi/fern-fastapi-server\n└─\n```\n</CodeBlock>\n\n### Step 3: Implement the server\n\nNotice you only need to provide the business logic. Just implement the function, and Fern takes care of the rest.\n\n<CodeBlock title = "backend/src/fern_fastapi_starter/movies_service.py">\n```python \nfrom .generated.fern import AbstractMoviesService, Movie, MovieDoesNotExistError, MovieId\n\nclass MoviesService(AbstractMoviesService):\n    def get_movie(self, *, movie_id: str) -> Movie:\n        if movie_id == "titanic":\n            return Movie(\n                id=MovieId.from_str("titantic"),\n                title="Titanic",\n                rating=9.8,\n            )\n        raise MovieDoesNotExistError(MovieId.from_str(movie_id))\n```\n</CodeBlock>\n\nAnd register your endpoints with Fern, which registers them with FastAPI under the hood:\n\n```python backend/src/fern_fastapi_starter/server.py\nfrom fastapi import FastAPI\n\nfrom .generated.fern.register import register\nfrom .movies_service import MoviesService\n\napp = FastAPI()\n\nregister(app, imdb=MoviesService())\n```\n\n### Step 4: Compile\n\nThe type checker will warn you if you make mistakes implementing your API.\n\n![Invalid return value](../images/invalid_return_value.png)\n\nIf you change the signature of the endpoint method, you\'ll get an error:\n\n![Invalid signature](../images/invalid_signature.png)\n\nYou can use the command line to check for compile errors:\n\n<CodeBlock title = "terminal">\n```bash\n$ poetry run mypy\nSuccess: no issues found in 24 source files\n```\n</CodeBlock>\n\n### Step 5: Run the server\n\n<CodeBlock title = "terminal">\n```bash\n$ poetry run start\nINFO:     Uvicorn running on http://0.0.0.0:8080 (Press CTRL+C to quit)\nINFO:     Started reloader process [32816] using StatReload\nINFO:     Started server process [32829]\nINFO:     Waiting for application startup.\nINFO:     Application startup complete.\n```\n</CodeBlock>\n\n### Step 6: Hit the API 🚀\n\n<CodeBlock title = "terminal">\n```bash\n$ curl --location --request GET --silent \'localhost:8080/movies/titanic\' | jq .\n{\n  "id": "titantic",\n  "title": "Titanic",\n  "rating": 9.8\n}\n\n$ curl --location --request GET --silent \'localhost:8080/movies/oceans-11\' | jq .\n{\n  "error": "MovieDoesNotExistError",\n  "errorInstanceId": "f6e1d69c-bf97-42d5-bc89-5e42773e3880",\n  "content": "oceans-11"\n}\n```\n</CodeBlock>\n\n',
                },
                "pages/server-boilerplate/spring.mdx": {
                    markdown:
                        'The Spring generator generates types and networking logic for your Spring server. This saves you time and add compile-time safety that you are serving the exact API that you specified in your API Definition.\n\n[Source code](https://github.com/fern-api/fern-java)\n[A starter repo for Express, using Fern](https://github.com/fern-api/spring-starter/)\n\nAvailable on the open source plan.\n\n## What Fern generates\n\n- Java classes for your API types\n- Exceptions that you can throw for non-200 responses\n- Abstract classes for you to define your business logic\n- All the networking/HTTP logic to call your API\n\n## Adding the Java generator\n\n<CodeBlock title="generators.yml">\n```yaml\n- name: fernapi/fern-java-spring\n  version: 0.5.10\n  output:\n    location: local-file-system\n    path: ../../generated/server-boilerplate/java\n```\n</CodeBlock>\n\n## Demo Video\n\nTODO\n\n## Spring Configurations\n\nTODO [https://github.com/fern-api/fern-java#spring-configuration](https://github.com/fern-api/fern-java#spring-configuration) ',
                },
                "pages/server-boilerplate/go.mdx": {
                    markdown:
                        '<Callout intent = "tip">\nComing in 2024!\n</Callout>\n\n<br />\n\nThe Go generator generates types and networking logic for your Go server. This saves you time and add compile-time safety that you are serving the exact API that you specified in your API Definition.\n\nWe are considering building support for the following frameworks:\n- [Standard library](https://pkg.go.dev/std): no need to rely on an external library.\n- [chi](https://github.com/go-chi/chi): a lightweight, idiomatic and composable router for building Go HTTP services.\n- [gin](https://github.com/gin-gonic/gin): a Martini-like API with much better performance -- up to 40 times faster.\n\n<CodeBlock title="generators.yml">\n```yaml\n- name: fernapi/fern-go-std\n  version: 0.0.0\n  output:\n    location: local-file-system\n    path: ../../generated/server-boilerplate/go\n```\n</CodeBlock>\n',
                },
                "pages/server-boilerplate/ruby-on-rails.mdx": {
                    markdown:
                        '<Callout intent = "tip">\nComing in 2024!\n</Callout>\n\n<br />\n\nThe Ruby on Rails generator generates types and networking logic for your Ruby on Rails server. This saves you time and add compile-time safety that you are serving the exact API that you specified in your API Definition.\n\n<CodeBlock title="generators.yml">\n```yaml\n- name: fernapi/fern-ruby-rails\n  version: 0.0.0\n  output:\n    location: local-file-system\n    path: ../../generated/server-boilerplate/ruby-rails\n```\n</CodeBlock>\n',
                },
                "pages/server-boilerplate/flask.mdx": {
                    markdown:
                        '<Callout intent = "tip">\nComing in 2024!\n</Callout>\n\n<br />\n\nThe Flask generator generates types and networking logic for your Flask server. This saves you time and add compile-time safety that you are serving the exact API that you specified in your API Definition.\n\n<CodeBlock title="generators.yml">\n```yaml\n- name: fernapi/fern-python-flask\n  version: 0.0.0\n  output:\n    location: local-file-system\n    path: ../../generated/server-boilerplate/flask\n```\n</CodeBlock>\n',
                },
                "pages/server-boilerplate/django.mdx": {
                    markdown:
                        '<Callout intent = "tip">\nComing in 2024!\n</Callout>\n\n<br />\n\nThe Django generator generates types and networking logic for your Django server. This saves you time and add compile-time safety that you are serving the exact API that you specified in your API Definition.\n\n<CodeBlock title="generators.yml">\n```yaml\n- name: fernapi/fern-python-django\n  version: 0.0.0\n  output:\n    location: local-file-system\n    path: ../../generated/server-boilerplate/django\n```\n</CodeBlock>\n',
                },
                "pages/api/intro.mdx": {
                    markdown:
                        'Welcome to Fern\'s API documentation! Here you\'ll find information about the various endpoints available to you,\nas well as the parameters and responses that they accept and return.\n\n<Callout intent="tip">\n  Note: Access to the API is available with our `Starter` and `Business` plans. Want to get set up? [Email us](mailto:sales@buildwithfern.com).\n</Callout>\n\n### API stability\n\nSome of the APIs documented within are undergoing active development. Use the <Availability type="beta" /> and <Availability type="GA"/>\ntags to differentiate between those that are stable and those that are not. GA stands for generally available.\n\n### Official API Clients\n\nVellum maintains official API clients for Python and Node/Typescript. We recommend using these clients to interact\nwith all stable endpoints. You can find them here:\n\n<Cards>\n  <Card\n    title="Node/Typescript"\n    icon="fa-brands fa-node"\n    href="https://github.com/fern-api/node-sdk"\n  />\n  <Card\n    title="Python"\n    icon="fa-brands fa-python"\n    href="https://github.com/fern-api/python-sdk"\n  />\n</Cards>\n',
                },
            },
            search: {
                type: "singleAlgoliaIndex" as const,
                value: {
                    type: "unversioned" as const,
                    indexSegment: {
                        id: "seg_fern.docs.buildwithfern.com_e917c2c7-0409-444c-986c-624b707ac2fc",
                        searchApiKey:
                            "YjhiMzNlZDI3NTNlNDQxOTA5YWE4ZDVkNmQwYTNlMDEwMzlhYTBkOGJhNjYzZWZmYzVkZjIwOWNkZmU4MTYzY2ZpbHRlcnM9aW5kZXhTZWdtZW50SWQlM0FzZWdfZmVybi5kb2NzLmJ1aWxkd2l0aGZlcm4uY29tX2U5MTdjMmM3LTA0MDktNDQ0Yy05ODZjLTYyNGI3MDdhYzJmYyZ2YWxpZFVudGlsPTE2OTkxMzgyNDc=",
                    },
                },
            },
            id: "docs_definition_5a4168a2-dfb8-4554-a9d4-c8ca6441ff12",
        },
        lightModeEnabled: false,
    },
    typographyStyleSheet:
        '\n                :root {\n                  --typography-code-block-font-family: Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace;\n                }\n        \n\n                .typography-font-code-block {\n                    font-family: var(--typography-code-block-font-family);\n                }\n        ',
    backgroundImageStyleSheet:
        "\n      :root {\n        --docs-background-image: url(https://fdr-prod-docs-files.s3.us-east-1.amazonaws.com/fern.docs.buildwithfern.com/2023-11-04T14%3A20%3A45.596Z/images/background.svg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA6KXJSKKNE6LAYO7B%2F20231104%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231104T142052Z&X-Amz-Expires=604800&X-Amz-Signature=2720e5efd9d940dcae6fbb017d8bbb1f97b829d2c40ae8e3657ec21eb9535831&X-Amz-SignedHeaders=host&x-id=GetObject);\n      }\n    ",
    resolvedPath: {
        type: "custom-markdown-page" as const,
        fullSlug: "overview/cli/fern-write-definition",
        page: {
            type: "page" as const,
            id: "pages/cli/fern-write-definition.mdx",
            title: "fern write definition",
            urlSlug: "fern-write-definition",
        },
        sectionTitle: "CLI",
        serializedMdxContent: {
            compiledSource:
                '/*@jsxRuntime automatic @jsxImportSource react*/\nconst {Fragment: _Fragment, jsx: _jsx, jsxs: _jsxs} = arguments[0];\nconst {useMDXComponents: _provideComponents} = arguments[0];\nfunction _createMdxContent(props) {\n  const _components = Object.assign({\n    p: "p",\n    code: "code",\n    pre: "pre"\n  }, _provideComponents(), props.components);\n  return _jsxs(_Fragment, {\n    children: [_jsxs(_components.p, {\n      children: [_jsx(_components.code, {\n        children: "fern write-definition"\n      }), " will convert your OpenAPI specification into a Fern Definition. You\'ll see a new folder called ", _jsx(_components.code, {\n        children: "definition"\n      }), " created."]\n    }), "\\n", _jsx(_components.pre, {\n      children: _jsx(_components.code, {\n        children: "fern/\\n├─ fern.config.json\\n├─ generators.yml\\n└─ openapi/\\n  └─ openapi.json\\n└─ definition/ <--- your Fern Definition\\n  └─ api.yml\\n  └─ __package__.yml\\n"\n      })\n    }), "\\n", _jsxs(_components.p, {\n      children: ["When you have an ", _jsx(_components.code, {\n        children: "openapi"\n      }), " folder and a ", _jsx(_components.code, {\n        children: "definition"\n      }), " folder, Fern defaults to reading your OpenAPI spec. Remove the ", _jsx(_components.code, {\n        children: "openapi"\n      }), " folder if you\'d like to use your Fern Definition as an input to Fern\'s generators."]\n    })]\n  });\n}\nfunction MDXContent(props = {}) {\n  const {wrapper: MDXLayout} = Object.assign({}, _provideComponents(), props.components);\n  return MDXLayout ? _jsx(MDXLayout, Object.assign({}, props, {\n    children: _jsx(_createMdxContent, props)\n  })) : _createMdxContent(props);\n}\nreturn {\n  default: MDXContent\n};\n',
            frontmatter: {},
            scope: {},
        },
    },
};

export const LocalPreviewApp: FC = () => {
    return (
        // <AppRouter
        //     buildId={""}
        //     initialTree={[]}
        //     initialCanonicalUrl={""}
        //     children={undefined}
        //     initialHead={undefined}
        //     assetPrefix={""}
        //     globalErrorComponent={undefined}
        // >
        <App
            docs={DEV_DOCS.docs as unknown as FernRegistryDocsRead.LoadDocsForUrlResponse}
            resolvedPath={DEV_DOCS.resolvedPath}
        />
        // </AppRouter>
    );
};
