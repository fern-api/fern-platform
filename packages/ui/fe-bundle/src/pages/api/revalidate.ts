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
            navigationConfig.versions.forEach(({ config, urlSlug: version }) => {
                if (isUnversionedUntabbedNavigationConfig(config)) {
                    const urlSlugTree = new UrlSlugTree({
                        items: config.items,
                        loadApiDefinition: (id) => docs.body.definition.apis[id],
                    });
                    const pathsForVersion = [
                        `/${version}`,
                        ...urlSlugTree.getAllSlugs().map((slug) => `/${version}/${slug}`),
                    ];
                    pathsToRevalidate.push(...pathsForVersion);
                } else {
                    config.tabs.forEach((tab) => {
                        const urlSlugTree = new UrlSlugTree({
                            items: tab.items,
                            loadApiDefinition: (id) => docs.body.definition.apis[id],
                        });
                        const pathsForVersionTab = [
                            `/${version}`,
                            `/${version}/${tab.urlSlug}`,
                            ...urlSlugTree.getAllSlugs().map((slug) => `/${version}/${tab.urlSlug}/${slug}`),
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
        const failures: string[] = [];
        await Promise.all(
            pathsToRevalidate.map(async (path) => {
                const didSucceed = await tryRevalidate(res, path);
                if (didSucceed) {
                    revalidated.push(path);
                } else {
                    failures.push(path);
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

async function tryRevalidate(res: NextApiResponse, path: string): Promise<boolean> {
    try {
        await res.revalidate(path);
        return true;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return false;
    }
}

export default handler;
