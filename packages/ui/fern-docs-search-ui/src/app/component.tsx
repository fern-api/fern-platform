"use client";

import { DesktopInstantSearch } from "@/components/desktop/DesktopInstantSearch";
import { createDefaultLinkComponent } from "@/components/shared/LinkComponent";
import type { ReactElement } from "react";

export function DesktopInstantSearchWrapper({
    appId,
    apiKey,
    domain,
}: {
    appId: string;
    apiKey: string;
    domain: string;
}): ReactElement {
    const handleSubmit = ({ pathname, hash }: { pathname: string; hash: string }) => {
        window.open(`https://${domain}${pathname}${hash}`, "_blank", "noopener,noreferrer");
    };

    return (
        <DesktopInstantSearch
            appId={appId}
            apiKey={apiKey}
            LinkComponent={createDefaultLinkComponent(domain)}
            onSubmit={handleSubmit}
        />
    );
}
