import classNames from "classnames";
import React from "react";
import { MdxContent } from "../../mdx/MdxContent";
import { SerializedMdxContent } from "../../util/mdx";
import styles from "./Markdown.module.scss";

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
            className={classNames(className, styles.container, "break-words max-w-none", {
                ["prose dark:prose-invert"]: !notProse,
            })}
        >
            <MdxContent mdx={mdx} />
        </article>
    );
});
