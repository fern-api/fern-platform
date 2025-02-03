"use server";

import { FernImage } from "@/components/image";
import { MaybeFernLink } from "@/components/link";
import { createCachedDocsLoader } from "@/server/cached-docs-loader";
import { cn } from "@fern-docs/components";
import { DEFAULT_LOGO_HEIGHT } from "@fern-docs/utils";

export default async function Page() {
  const docsLoader = await createCachedDocsLoader();

  const [config, colors] = await Promise.all([
    docsLoader.getConfig(),
    docsLoader.getColors(),
  ]);

  const logoLight = colors.light?.logo ?? colors.dark?.logo;
  const logoDark = colors.dark?.logo ?? colors.light?.logo;
  const logoStyle = {
    height: config?.logoHeight ?? DEFAULT_LOGO_HEIGHT,
    width: "auto",
  };

  return (
    <header
      id="fern-header"
      role="banner"
      className={cn(
        "fixed inset-x-0 top-0 z-30",
        // https://github.com/theKashey/react-remove-scroll-bar/blob/master/src/constants.ts#L2
        "width-before-scroll-bar"
      )}
    >
      <div className="clipped-background">
        <div
          className={cn("fern-background", {
            "from-accent/10 bg-gradient-to-b to-transparent":
              !colors.light?.background && !colors.light?.backgroundImage,
            "dark:from-accent/10 dark:bg-gradient-to-b dark:to-transparent":
              !colors.dark?.background && !colors.dark?.backgroundImage,
            "dark:from-transparent":
              !!colors.dark?.background && !colors.dark?.backgroundImage,
            "fern-background-image": !!colors.light?.backgroundImage,
            "fern-background-image-dark": !!colors.dark?.backgroundImage,
          })}
        />
      </div>
      <div className="mx-auto max-w-[var(--spacing-page-width)]">
        <div className="relative flex h-full min-w-fit flex-1 shrink-0 items-center gap-2 py-1">
          <MaybeFernLink href={config?.logoHref}>
            {logoLight && (
              <FernImage
                className="fern-logo"
                data-theme={!!logoDark ? "light" : undefined}
                alt={logoLight.alt ?? "Logo"}
                src={logoLight.url}
                height={logoLight.height}
                width={logoLight.width}
                blurDataURL={logoLight.blurDataUrl}
                priority
                loading="eager"
                quality={100}
                style={logoStyle}
              />
            )}
            {logoDark && (
              <FernImage
                className="fern-logo"
                data-theme={!!logoLight ? "dark" : undefined}
                alt={logoDark.alt ?? "Logo"}
                src={logoDark.url}
                height={logoDark.height}
                width={logoDark.width}
                blurDataURL={logoDark.blurDataUrl}
                priority
                loading="eager"
                quality={100}
                style={logoStyle}
              />
            )}
          </MaybeFernLink>
        </div>
      </div>
    </header>
  );
}
