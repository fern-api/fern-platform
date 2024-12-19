import Head from "next/head";
import { ReactElement } from "react";
import { useApiRoute } from "../atoms";
import { useIsLocalPreview } from "../contexts/local-preview";

export function LinkPreload({ href }: { href: string }): ReactElement {
    return (
        <Head>
            <link key={href} rel="preload" href={href} as="fetch" crossOrigin="anonymous" />
        </Head>
    );
}

type FernDocsApiRoute = `/api/fern-docs/${string}`;
export function LinkPreloadApiRoute({ href }: { href: FernDocsApiRoute }): ReactElement | null {
    const isLocalPreview = useIsLocalPreview();
    const key = useApiRoute(href);
    if (isLocalPreview) {
        return null;
    }
    return <LinkPreload href={key} />;
}
