"use client";

import { useParams } from "next/navigation";

export function OrgTitle(): React.ReactElement {
    const { org } = useParams();
    return <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">{org}</h3>;
}
