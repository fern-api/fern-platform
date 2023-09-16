import { isUnversionedUntabbedNavigationConfig, isVersionedNavigationConfig, UrlSlugTree } from "@fern-ui/app-utils";
import { NextApiHandler, NextApiResponse } from "next";
import { REGISTRY_SERVICE } from "../../service";

export interface Request {
    url: string;
}

const handler: NextApiHandler = async (req, res) => {
    try {
        const url = req.body?.url;

        if (url == null) {
            return res.status(400).send("Property 'url' is missing from request.");
        }
        if (typeof url !== "string") {
            return res.status(400).send("Property 'url' is not a string.");
        }

        // when we call res.revalidate() nextjs uses
        // req.headers.host to make the network request
        if (typeof req.headers["x-fern-host"] === "string") {
            req.headers.host = req.headers["x-fern-host"];
        }

        const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
            url,
        });
        if (!docs.ok) {
            // eslint-disable-next-line no-console
            console.error("Failed to fetch docs", docs.error);
            return res.status(500).send("Failed to load docs for: " + url);
        }

        const { navigation: navigationConfig } = docs.body.definition.config;

        // eslint-disable-next-line no-console
        console.log("Finding paths to revalidate");

        let pathsToRevalidate: string[] = [];

        if (isVersionedNavigationConfig(navigationConfig)) {
            navigationConfig.versions.forEach((version) => {
                if (isUnversionedUntabbedNavigationConfig(version.config)) {
                    const urlSlugTree = new UrlSlugTree({
                        items: version.config.items,
                        loadApiDefinition: (id) => docs.body.definition.apis[id],
                    });
                    const pathsForVersion = [
                        `/${version.urlSlug}`,
                        ...urlSlugTree.getAllSlugs().map((slug) => `/${version.urlSlug}/${slug}`),
                    ];
                    pathsToRevalidate.push(...pathsForVersion);
                } else {
                    version.config.tabs.forEach((tab) => {
                        const urlSlugTree = new UrlSlugTree({
                            items: tab.items,
                            loadApiDefinition: (id) => docs.body.definition.apis[id],
                        });
                        const pathsForVersionTab = [
                            `/${version.urlSlug}`,
                            `/${version.urlSlug}/${tab.urlSlug}`,
                            ...urlSlugTree.getAllSlugs().map((slug) => `/${version.urlSlug}/${tab.urlSlug}/${slug}`),
                        ];
                        pathsToRevalidate.push(...pathsForVersionTab);
                    });
                }
            });
        } else if (isUnversionedUntabbedNavigationConfig(navigationConfig)) {
            const urlSlugTree = new UrlSlugTree({
                items: navigationConfig.items,
                loadApiDefinition: (id) => docs.body.definition.apis[id],
            });
            pathsToRevalidate = ["/", ...urlSlugTree.getAllSlugs().map((slug) => `/${slug}`)];
        } else {
            pathsToRevalidate = ["/"];
            navigationConfig.tabs.forEach((tab) => {
                const urlSlugTree = new UrlSlugTree({
                    items: tab.items,
                    loadApiDefinition: (id) => docs.body.definition.apis[id],
                });
                pathsToRevalidate.push(...urlSlugTree.getAllSlugs().map((slug) => `/${tab.urlSlug}/${slug}`));
            });
        }

        // eslint-disable-next-line no-console
        console.log(`Found ${pathsToRevalidate.length} paths to revalidate`);

        const revalidated: string[] = [];
        const failures: RevalidateFailure[] = [];
        await Promise.all(
            pathsToRevalidate.map(async (path) => {
                const response = await tryRevalidate(res, path);
                if (response.type === "success") {
                    revalidated.push(path);
                } else {
                    failures.push(response);
                }
            })
        );

        // eslint-disable-next-line no-console
        console.log(`Revalidated all paths with ${revalidated.length} revalidated and ${failures.length} failures`);

        return res.json({ revalidated, failures });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to revalidate", err);
        return res.status(500).send("Failed to revalidate " + (err as Error)?.message);
    }
};

type RevalidateResponse = RevalidateSuccess | RevalidateFailure;

interface RevalidateSuccess {
    type: "success";
}

interface RevalidateFailure {
    type: "failure";
    error: string;
}

async function tryRevalidate(res: NextApiResponse, path: string): Promise<RevalidateResponse> {
    try {
        await res.revalidate(path);
        return {
            type: "success",
        };
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return {
            type: "failure",
            error: (err as Error)?.message ?? "No error message",
        };
    }
}

export default handler;
