"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, type ReactElement } from "react";
import { handleReindex } from "./actions/reindex";
import { DemoInstantSearchClient } from "./client-component";

export function DesktopInstantSearchWrapper({ appId }: { appId: string }): ReactElement {
    const searchParams = useSearchParams();
    const selectedDomain = searchParams.get("domain") ?? "buildwithfern.com";

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.metaKey && e.shiftKey && e.key === "k") {
                e.preventDefault();
                e.stopPropagation();

                alert("Reindexing...");
                void handleReindex(selectedDomain);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [selectedDomain]);

    return (
        <div className="w-[500px]">
            <DemoInstantSearchClient appId={appId} domain={selectedDomain} />
        </div>
    );
}
