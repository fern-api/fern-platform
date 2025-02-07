"use server";

import { FernLinkButton } from "@/components/components/FernLinkButton";
import {
  HeaderLogoContainer,
  HeaderLogoImage,
} from "@/components/header/HeaderLogoImage";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { getDocsDomainApp } from "@/server/xfernhost/app";
import { Badge } from "@fern-docs/components";
import {
  addLeadingSlash,
  conformTrailingSlash,
  DEFAULT_LOGO_HEIGHT,
} from "@fern-docs/utils";
import { Undo2 } from "lucide-react";

export default async function NotFound() {
  const loader = await createCachedDocsLoader(getDocsDomainApp());
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
          <HeaderLogoContainer href={config?.logoHref}>
            <HeaderLogoImage
              light={colors.light?.logo}
              dark={colors.dark?.logo}
              alt={config?.title ?? "Logo"}
              height={config?.logoHeight ?? DEFAULT_LOGO_HEIGHT}
            />
          </HeaderLogoContainer>
          <p className="text-lg">
            We can&apos;t find the page you are looking for.
          </p>
          <FernLinkButton
            href={conformTrailingSlash(
              addLeadingSlash(baseUrl.basePath || "/")
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
