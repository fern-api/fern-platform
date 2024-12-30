import { Env } from "@libs/env";
import { App } from "octokit";

export const dashboard = async (app: App): Promise<Response> => {
    const { data } = await app.octokit.request("GET /app");

    return new Response(
        `
<h1>GitHub App: ${data?.name}</h1>

<p>Installation count: ${data?.installations_count}</p>

<p>
    <a href="https://github.com/apps/${data?.slug}">
        <img src="https://img.shields.io/static/v1?label=Install%20App:&message=${data?.slug}&color=orange&logo=github&style=for-the-badge" alt="Install ${data?.name}"/>
    </a>
</p>

<p>
    <a href="https://github.com/fernapi/fern-platform/servers/fern-bot-worker/README.md">source code</a>
</p>
`,
        {
            headers: { "content-type": "text/html" },
        },
    );
};

export const setupGithubApp = (env: Env): App => {
    const app = new App({
        appId: env.GITHUB_APP_ID,
        privateKey: env.GITHUB_APP_PRIVATE_KEY,
        oauth: {
            clientId: env.GITHUB_APP_CLIENT_ID,
            clientSecret: env.GITHUB_APP_CLIENT_SECRET,
        },
        webhooks: {
            secret: env.GITHUB_APP_WEBHOOK_SECRET,
        },
    });

    app.log.debug("Application loaded successfully.");
    return app;
};
