"use server";

import { ReactElement, Suspense } from "react";

import { algoliaAppId } from "@/server/env-variables";
import { DesktopInstantSearchWrapper } from "./wrapper";

export default async function Home(): Promise<ReactElement> {
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
      <main className="row-start-2 flex w-full max-w-[500px] flex-col items-center gap-8 sm:items-start">
        <Suspense fallback={<div>Loading...</div>}>
          <DesktopInstantSearchWrapper appId={algoliaAppId()} />
        </Suspense>
      </main>
    </div>
  );
}
