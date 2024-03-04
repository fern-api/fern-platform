import classNames from "classnames";
import React from "react";
import { SerializedMdxContent } from "./mdx";
import { MdxContent } from "./MdxContent";

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
            className={classNames(className, "break-words max-w-none", {
                ["prose dark:prose-invert"]: !notProse,
            })}
        >
            <MdxContent mdx={mdx} />
        </article>
    );
});
