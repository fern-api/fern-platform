"use client";

import { useState, type ReactElement } from "react";
import { useFormStatus } from "react-dom";
import { handleReindex } from "./actions/reindex";
import { DesktopInstantSearchClient } from "./client-component";

export function DesktopInstantSearchWrapper({ appId }: { appId: string }): ReactElement {
    const [selectedDomain, setSelectedDomain] = useState("buildwithfern.com");

    return (
        <>
            <h1 className="text-2xl font-semibold">Search Demo</h1>
            <select
                className="border rounded-md p-2"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
            >
                <option value="buildwithfern.com">buildwithfern.com</option>
                <option value="docs.cohere.com">docs.cohere.com</option>
                <option value="workato.docs.buildwithfern.com">workato.docs.buildwithfern.com</option>
                <option value="developers.webflow.com">developers.webflow.com</option>
            </select>

            <div className="w-[500px]">
                <DesktopInstantSearchClient appId={appId} domain={selectedDomain} />
            </div>

            <form action={() => handleReindex(selectedDomain)}>
                <SubmitButton />
            </form>
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
