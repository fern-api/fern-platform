"use client";

import { useState, type ReactElement } from "react";
import { useFormStatus } from "react-dom";
import { handleReindex } from "./actions/reindex";
import { DesktopInstantSearchClient } from "./client-component";

export function DesktopInstantSearchWrapper({ appId }: { appId: string }): ReactElement {
    const [selectedDomain, setSelectedDomain] = useState("buildwithfern.com");

    return (
        <>
            <div className="flex gap-2 w-full">
                <select
                    className="border rounded-md p-2 dark:bg-black"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                >
                    <option value="buildwithfern.com">buildwithfern.com</option>
                    <option value="docs.cohere.com">docs.cohere.com</option>
                    <option value="workato.docs.buildwithfern.com">workato.docs.buildwithfern.com</option>
                    <option value="developers.webflow.com">developers.webflow.com</option>
                </select>
                <div className="flex-1" />
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
