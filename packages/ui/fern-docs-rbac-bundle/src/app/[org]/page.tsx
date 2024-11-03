"use server";

import { redirect } from "next/navigation";

export default async function Home({ params }: { params: Promise<{ org: string }> }): Promise<React.ReactElement> {
    const { org } = await params;

    redirect(`/${org}/users`);
}
