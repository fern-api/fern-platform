"use server";

import { workos } from "@/workos";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { notFound, redirect } from "next/navigation";

export default async function Home(): Promise<React.ReactElement> {
    const { user } = await withAuth({ ensureSignedIn: true });

    const orgsResult = await workos.fga
        .query({ q: `select org where user:${user.email} is member` })
        .then((result) => result.autoPagination());

    if (orgsResult.length === 0) {
        notFound();
    }

    const orgs = orgsResult.map((org) => org.resourceId);

    if (orgs.length === 1) {
        redirect(`/${orgs[0]}`);
    }

    // TODO: Add a dropdown to select the organization
    notFound();
}
