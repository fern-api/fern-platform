"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactElement } from "react";
import { useFormStatus } from "react-dom";
import { handleReindex } from "./actions/reindex";
import { DesktopInstantSearchClient } from "./client-component";

export function DesktopInstantSearchWrapper({ appId }: { appId: string }): ReactElement {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedDomain, setSelectedDomain] = useState(() => searchParams.get("domain") ?? "buildwithfern.com");

    return (
        <>
            <div className="flex gap-4 w-full">
                <form
                    className="flex gap-4 flex-1"
                    onSubmit={(e) => {
                        e.preventDefault();
                        try {
                            const url = new URL(
                                e.currentTarget.domain.value.startsWith("http")
                                    ? e.currentTarget.domain.value
                                    : `https://${e.currentTarget.domain.value}`,
                            );
                            setSelectedDomain(url.hostname);
                            router.replace(`?domain=${url.hostname}`);
                        } catch (_error) {
                            alert(`Invalid domain: ${e.currentTarget.domain.value}`);
                        }
                    }}
                >
                    <Input
                        name="domain"
                        className="border rounded-md p-2 bg-white dark:bg-black flex-1"
                        placeholder="yourdocs.docs.buildwithfern.com"
                        defaultValue={selectedDomain}
                    />
                    <Button type="submit" className="border rounded-md p-2">
                        Set Domain
                    </Button>
                </form>
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
        <Button type="submit" disabled={pending} className="border rounded-md p-2 disabled:opacity-50">
            Reindex
        </Button>
    );
}
