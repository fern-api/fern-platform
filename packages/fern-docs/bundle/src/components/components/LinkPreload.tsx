import Head from "next/head";
import { ReactElement } from "react";
import { useIsLocalPreview } from "../contexts/local-preview";
import { useApiRoute } from "../hooks/useApiRoute";

export function LinkPreload({ href }: { href: string }): ReactElement<any> {
  return (
    <Head>
      <link
        key={href}
        rel="preload"
        href={href}
        as="fetch"
        crossOrigin="anonymous"
      />
    </Head>
  );
}

type FernDocsApiRoute = `/api/fern-docs/${string}`;
export function LinkPreloadApiRoute({
  href,
}: {
  href: FernDocsApiRoute;
}): ReactElement<any> | null {
  const isLocalPreview = useIsLocalPreview();
  const key = useApiRoute(href);
  if (isLocalPreview) {
    return null;
  }
  return <LinkPreload href={key} />;
}
