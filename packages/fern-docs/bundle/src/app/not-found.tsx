import { Undo2 } from "lucide-react";

import { Badge } from "@fern-docs/components";
import { addLeadingSlash, conformTrailingSlash } from "@fern-docs/utils";

import { FernLinkButton } from "@/components/components/FernLinkButton";
import { Logo } from "@/components/logo";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { getDocsDomainApp } from "@/server/xfernhost/app";

export default async function NotFound() {
  const domain = await getDocsDomainApp();
  const loader = await createCachedDocsLoader(domain);
  const [baseUrl, colors, config] = await Promise.all([
    loader.getBaseUrl(),
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
              height: config?.logoHeight,
              href: config?.logoHref,
            }}
            alt={config?.title}
          />
          <p className="text-lg">
            We can&apos;t find the page you are looking for.
          </p>
          <FernLinkButton
            href={addLeadingSlash(
              conformTrailingSlash(baseUrl.basePath || "/")
            )}
            variant="filled"
            intent="primary"
            rightIcon={<Undo2 />}
          >
            Return home
          </FernLinkButton>
        </div>
      </article>
    </main>
  );
}
