"use server";

import { DesktopInstantSearch } from "@/components/desktop/DesktopInstantSearch";
import { algoliaAdminApiKey, algoliaAppId, algoliaSearchApikey } from "@/server/env-variables";
import { withSearchApiKey } from "@/server/with-search-api-key";
import { ReactElement } from "react";

export default async function Home(): Promise<ReactElement> {
    const apiKey = withSearchApiKey({
        appId: algoliaAppId(),
        adminApiKey: algoliaAdminApiKey(),
        parentApiKey: algoliaSearchApikey(),
        domain: "fern.docs.dev.buildwithfern.com",
        roles: [],
        authed: false,
    });

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <DesktopInstantSearch appId={algoliaAppId()} apiKey={apiKey} />
            </main>
        </div>
    );
}
