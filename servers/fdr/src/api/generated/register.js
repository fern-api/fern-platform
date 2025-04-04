/**
 * This file was auto-generated by Fern from our API Definition.
 */
export function register(expressApp, services) {
    expressApp.use("/registry/api/latest", services.api.latest._root.toRouter());
    expressApp.use("/registry/api", services.api.v1.read._root.toRouter());
    expressApp.use("/registry/api", services.api.v1.register._root.toRouter());
    expressApp.use("/dashboard", services.dashboard._root.toRouter());
    expressApp.use("/registry/docs", services.docs.v1.read._root.toRouter());
    expressApp.use("/registry/docs", services.docs.v1.write._root.toRouter());
    expressApp.use("/v2/registry/docs", services.docs.v2.read._root.toRouter());
    expressApp.use("/v2/registry/docs", services.docs.v2.write._root.toRouter());
    expressApp.use("/generators", services.generators._root.toRouter());
    expressApp.use("/registry", services.diff.toRouter());
    expressApp.use("/docs-cache", services.docsCache.toRouter());
    expressApp.use("/generators/cli", services.generators.cli.toRouter());
    expressApp.use("/generators/versions", services.generators.versions.toRouter());
    expressApp.use("/generators/github", services.git.toRouter());
    expressApp.use("/sdks", services.sdks.versions.toRouter());
    expressApp.use("/snippets", services.snippetsFactory.toRouter());
    expressApp.use("/snippets", services.snippets.toRouter());
    expressApp.use("/snippet-template", services.templates.toRouter());
    expressApp.use("/tokens", services.tokens.toRouter());
}
