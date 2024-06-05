import cn from "clsx";
import React from "react";
import { MdxContent } from "./MdxContent.js";
import { SerializedMdxContent } from "./mdx.js";

export declare namespace Markdown {
    export interface Props {
        mdx: SerializedMdxContent | undefined;
        className?: string;
        notProse?: boolean;
    }
}

export const Markdown = React.memo<Markdown.Props>(function Markdown({ mdx, notProse, className }) {
    if (mdx == null) {
        return null;
    }

    return (
        <article
            className={cn(className, "break-words max-w-none", {
                ["prose dark:prose-invert"]: !notProse,
            })}
        >
            <MdxContent mdx={mdx} />
        </article>
    );
});
