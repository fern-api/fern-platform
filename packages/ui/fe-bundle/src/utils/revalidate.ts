import { FernRegistry } from "@fern-fern/registry-browser";
import { isUnversionedUntabbedNavigationConfig, isVersionedNavigationConfig, UrlSlugTree } from "@fern-ui/app-utils";

export function getPathsToRevalidate(docsDefinition: FernRegistry.docs.v1.read.DocsDefinition): string[] {
    const { navigation: navigationConfig } = docsDefinition.config;
    let paths: string[] = ["/"];

    if (isVersionedNavigationConfig(navigationConfig)) {
        navigationConfig.versions.forEach(({ version, config }) => {
            if (isUnversionedUntabbedNavigationConfig(config)) {
                const urlSlugTree = new UrlSlugTree({
                    items: config.items,
                    loadApiDefinition: (id) => docsDefinition.apis[id],
                });
                const pathsForVersion = [
                    `/${version}`,
                    ...urlSlugTree.getAllSlugs().map((slug) => `/${version}/${slug}`),
                ];
                paths.push(...pathsForVersion);
            } else {
                config.tabs.forEach((tab) => {
                    const urlSlugTree = new UrlSlugTree({
                        items: tab.items,
                        loadApiDefinition: (id) => docsDefinition.apis[id],
                    });
                    const pathsForVersionTab = [
                        `/${version}`,
                        `/${version}/${tab.urlSlug}`,
                        ...urlSlugTree.getAllSlugs().map((slug) => `/${version}/${tab.urlSlug}/${slug}`),
                    ];
                    paths.push(...pathsForVersionTab);
                });
            }
        });
    } else if (isUnversionedUntabbedNavigationConfig(navigationConfig)) {
        const urlSlugTree = new UrlSlugTree({
            items: navigationConfig.items,
            loadApiDefinition: (id) => docsDefinition.apis[id],
        });
        paths = [...urlSlugTree.getAllSlugs().map((slug) => `/${slug}`)];
    } else {
        navigationConfig.tabs.forEach((tab) => {
            const urlSlugTree = new UrlSlugTree({
                items: tab.items,
                loadApiDefinition: (id) => docsDefinition.apis[id],
            });
            paths.push(...urlSlugTree.getAllSlugs().map((slug) => `/${tab.urlSlug}/${slug}`));
        });
    }
    return paths;
}
