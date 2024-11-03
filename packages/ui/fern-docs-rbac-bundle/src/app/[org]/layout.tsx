"use server";

import { PropsWithChildren } from "react";
import { OrgTabs } from "./components/org-tabs";

export default async function Home({ children }: PropsWithChildren): Promise<React.ReactElement> {
    return (
        <div className="p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-[600px] mx-auto">
                <OrgTabs />

                <section className="w-full">{children}</section>
            </main>
        </div>
    );
}
