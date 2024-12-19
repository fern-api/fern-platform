"use server";

import { ReactElement, Suspense } from "react";

import { algoliaAppId } from "@/server/env-variables";
import { DesktopInstantSearchWrapper } from "./wrapper";

export default async function Home(): Promise<ReactElement> {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-[500px] w-full">
        <Suspense fallback={<div>Loading...</div>}>
          <DesktopInstantSearchWrapper appId={algoliaAppId()} />
        </Suspense>
      </main>
    </div>
  );
}
