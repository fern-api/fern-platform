/* eslint-disable @next/next/no-img-element */
import { ServicePage } from "@/components/ServicePage";
import { roboto } from "@/fonts/roboto";
import { root } from "@/gemini";
import clsx from "clsx";
import { ReactElement } from "react";



// function pathToString(path: FernIr.HttpPath): string {
//     return urljoin(path.head, ...path.parts.flatMap((part) => [`:${part.pathParameter}`, part.tail]));
// }


export default function Home(): ReactElement {
    return (
        <main className={clsx(roboto.className, "flex min-h-screen")}>
            <aside className="shadow-google sticky top-0 h-screen w-[280px]">
                <div className="p-4 pb-2">
                    <img src="/google-ai-for-developers.svg" alt="Logo" />
                </div>
            </aside>
            <article className="flex-1">
                <ServicePage node={root} />
            </article>
        </main>
    );
}
