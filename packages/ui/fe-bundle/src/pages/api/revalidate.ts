import { NextApiHandler, NextApiResponse } from "next";
import { REGISTRY_SERVICE } from "../../service";
import { UrlSlugTree } from "../../url-path-resolver/UrlSlugTree";
import { isVersionedNavigationConfig } from "../../utils/docs";

export interface Request {
    url: string;
}

const handler: NextApiHandler = async (req, res) => {
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

    let pathsToRevalidate: string[] = [];

    if (isVersionedNavigationConfig(navigationConfig)) {
        navigationConfig.versions.forEach(({ version, config }) => {
            const urlSlugTree = new UrlSlugTree({
                navigation: config,
                loadApiDefinition: (id) => docs.body.definition.apis[id],
            });
            const pathsForVersion = [`/${version}`, ...urlSlugTree.getAllSlugs().map((slug) => `/${version}/${slug}`)];
            pathsToRevalidate.push(...pathsForVersion);
        });
    } else {
        const urlSlugTree = new UrlSlugTree({
            navigation: navigationConfig,
            loadApiDefinition: (id) => docs.body.definition.apis[id],
        });
        pathsToRevalidate = ["/", ...urlSlugTree.getAllSlugs().map((slug) => `/${slug}`)];
    }

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

    return res.json({ revalidated, failures });
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
