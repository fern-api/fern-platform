import cn from "clsx";
import dynamic from "next/dynamic";
import type { BundledMDX } from "../mdx/types";

const Markdown = dynamic(() => import("../mdx/Markdown").then(({ Markdown }) => Markdown), {
    ssr: true,
});

export declare namespace ApiPageDescription {
    export interface Props {
        className?: string;
        description: BundledMDX | undefined;
        isMarkdown: boolean;
    }
}

export const ApiPageDescription: React.FC<ApiPageDescription.Props> = ({ className, description }) => {
    return (
        <Markdown
            className={cn(
                className,
                className?.includes("text-sm") ? "prose-sm dark:prose-invert-sm" : "prose dark:prose-invert",
            )}
            notProse
            mdx={description}
        />
    );
};
