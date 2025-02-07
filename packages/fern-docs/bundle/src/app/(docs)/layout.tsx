"use server";

import { createCachedDocsLoader } from "@/server/docs-loader";
import { RgbaColor } from "@/server/types";
import { getDocsDomainApp } from "@/server/xfernhost/app";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { compact } from "es-toolkit/array";
import { cookies } from "next/headers";
import { Metadata, Viewport } from "next/types";
import tinycolor from "tinycolor2";
import { toImageDescriptor } from "../seo";

export default async function Layout({
  children,
  // header,
}: {
  children: React.ReactNode;
  // header: React.ReactNode;
}) {
  // relative z-0 ensures that dialogs and popovers are always rendered above the header
  return <div className="relative z-0">{children}</div>;
}

export async function generateViewport(): Promise<Viewport> {
  const domain = getDocsDomainApp();
  const docsLoader = await createCachedDocsLoader(domain);
  const colors = await docsLoader.getColors();
  const dark = maybeToHex(
    colors.dark?.background ?? colors.dark?.accentPrimary
  );
  const light = maybeToHex(
    colors.light?.background ?? colors.light?.accentPrimary
  );
  return {
    themeColor: compact([
      dark ? { color: dark, media: "(prefers-color-scheme: dark)" } : undefined,
      light
        ? { color: light, media: "(prefers-color-scheme: light)" }
        : undefined,
    ]),
  };
}

function maybeToHex(color: RgbaColor | undefined): string | undefined {
  if (color == null) {
    return undefined;
  }
  return tinycolor(color).toHexString();
}

export async function generateMetadata(): Promise<Metadata> {
  const domain = getDocsDomainApp();
  const fern_token = cookies().get("fern_token")?.value;
  const docsLoader = await createCachedDocsLoader(domain, fern_token);
  const [files, config, baseUrl] = await Promise.all([
    docsLoader.getFiles(),
    docsLoader.getConfig(),
    docsLoader.getBaseUrl(),
  ]);
  const index = config?.metadata?.noindex ? false : undefined;
  const follow = config?.metadata?.nofollow ? false : undefined;

  return {
    metadataBase: new URL(
      baseUrl.basePath || "/",
      withDefaultProtocol(docsLoader.domain)
    ),
    applicationName: config?.title,
    title: {
      template: config?.title ? "%s | " + config?.title : "%s",
      default: config?.title ?? "Documentation",
    },
    robots: { index, follow },
    openGraph: {
      title: config?.metadata?.["og:title"],
      description: config?.metadata?.["og:description"],
      locale: config?.metadata?.["og:locale"],
      url: config?.metadata?.["og:url"],
      siteName: config?.metadata?.["og:site_name"],
      images: toImageDescriptor(
        files,
        config?.metadata?.["og:image"],
        config?.metadata?.["og:image:width"],
        config?.metadata?.["og:image:height"]
      ),
    },
    twitter: {
      site: config?.metadata?.["twitter:site"],
      creator: config?.metadata?.["twitter:handle"],
      title: config?.metadata?.["twitter:title"],
      description: config?.metadata?.["twitter:description"],
      images: toImageDescriptor(files, config?.metadata?.["twitter:image"]),
    },
    icons: {
      icon: config?.favicon
        ? toImageDescriptor(files, {
            type: "fileId",
            value: config.favicon,
          })?.url
        : undefined,
    },
  };
}
