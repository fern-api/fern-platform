import type { DocsPage } from "@fern-ui/ui";
import type { FernUser } from "@fern-ui/ui/auth";
import type { GetServerSidePropsResult } from "next";
import type { ComponentProps } from "react";
import type { AuthProps } from "./authProps";
import { getUnauthenticatedRedirect } from "./getUnauthenticatedRedirect";
import { loadDocsAndTrack } from "./loadDocsAndTrack";
import { withInitialPropsAndTrack } from "./withInitialProps";

type SSGDocsPageProps = GetServerSidePropsResult<ComponentProps<typeof DocsPage>>;

export interface User {
    isAuthenticated: boolean;
    user?: FernUser;
}

export async function getDocsPageProps(
    xFernHost: string | undefined,
    slug: string[],
    auth?: AuthProps,
): Promise<SSGDocsPageProps> {
    if (xFernHost == null || Array.isArray(xFernHost)) {
        return { notFound: true };
    }

    const docs = await loadDocsAndTrack(xFernHost, slug, auth);

    if (!docs.ok) {
        if (docs.error.error === "UnauthorizedError") {
            const redirect = await getUnauthenticatedRedirect(xFernHost, encodeURI(slug.join("/")));
            return { redirect };
        } else if (docs.error.error === "DomainNotRegisteredError") {
            return { notFound: true };
        }

        throw new Error("Failed to fetch docs", { cause: docs.error });
    }

    return withInitialPropsAndTrack({ docs: docs.body, slug, xFernHost });
}
