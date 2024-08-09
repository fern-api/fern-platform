import cn from "clsx";
import React from "react";
import { MdxContent } from "./MdxContent";
import type { BundledMDX } from "./types";

export declare namespace Markdown {
    export interface Props {
        mdx: BundledMDX | undefined;
        className?: string;
        notProse?: boolean;
    }
}

export const Markdown = React.memo<Markdown.Props>(function Markdown({ mdx, notProse, className }) {
    // If the MDX is empty, return null
    if (mdx == null || (typeof mdx === "string" && mdx.trim().length === 0)) {
        return null;
    }

    return (
        <section
            className={cn(className, "break-words max-w-none", {
                ["prose dark:prose-invert"]: !notProse,
            })}
        >
            <MdxContent mdx={mdx} />
        </section>
    );
});
