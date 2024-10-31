"use client";

import { useSearchParams } from "next/navigation";
import { useState, type ReactElement } from "react";
import { useFormStatus } from "react-dom";
import { handleReindex } from "./actions/reindex";
import { DesktopInstantSearchClient } from "./client-component";

export function DesktopInstantSearchWrapper({ appId }: { appId: string }): ReactElement {
    const searchParams = useSearchParams();
    const [selectedDomain, setSelectedDomain] = useState(() => searchParams.get("domain") ?? "buildwithfern.com");

    return (
        <>
            <div className="flex gap-4 w-full">
                <input
                    className="border rounded-md p-2 dark:bg-black flex-1"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    placeholder="yourdocs.docs.buildwithfern.com"
                />
                <form action={() => handleReindex(selectedDomain)}>
                    <SubmitButton />
                </form>
            </div>

            <div className="w-[500px]">
                <DesktopInstantSearchClient appId={appId} domain={selectedDomain} />
            </div>
        </>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="border rounded-md p-2 disabled:opacity-50">
            Reindex
        </button>
    );
}
