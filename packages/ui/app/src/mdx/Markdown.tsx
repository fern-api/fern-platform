import cn from "clsx";
import React from "react";
import { MdxContent } from "./MdxContent";
import { SerializedMdxContent } from "./mdx";

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
        <section
            className={cn(className, "break-words max-w-none", {
                ["prose dark:prose-invert"]: !notProse,
            })}
        >
            <MdxContent mdx={mdx} />
        </section>
    );
});
