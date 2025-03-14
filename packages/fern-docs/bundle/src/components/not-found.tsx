import "server-only";

import { Undo2 } from "lucide-react";

import { Badge } from "@fern-docs/components";

import { FernLinkButton } from "@/components/FernLinkButton";
import { Logo } from "@/components/logo";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { cleanBasePath } from "@/server/utils/clean-base-path";
import { getDocsDomainApp, getDocsHostApp } from "@/server/xfernhost/app";

export default async function NotFound() {
  const host = await getDocsHostApp();
  const domain = await getDocsDomainApp();
  const loader = await createCachedDocsLoader(host, domain);
  const [baseUrl, colors, config] = await Promise.all([
    loader.getMetadata(),
    loader.getColors(),
    loader.getConfig(),
  ]);

  return (
    <main className="h-screen">
      <article className="relative flex h-full flex-col items-center justify-center">
        <div className="flex w-full max-w-xl flex-col items-center gap-3 px-10">
          <Badge>Error 404</Badge>
          <Logo
            logo={{
              light: colors.light?.logo,
              dark: colors.dark?.logo,
              height: config.logoHeight,
              href: config.logoHref,
            }}
            alt={config.title}
          />
          <p className="text-lg">
            We can&apos;t find the page you are looking for.
          </p>
          <FernLinkButton
            href={cleanBasePath(baseUrl.basePath) || "/"}
            variant="filled"
            intent="primary"
            rightIcon={<Undo2 />}
            scroll={true}
          >
            Return home
          </FernLinkButton>
        </div>
      </article>
    </main>
  );
}
