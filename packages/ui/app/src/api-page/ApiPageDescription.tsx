import classNames from "classnames";
import dynamic from "next/dynamic";
import { SerializedMdxContent } from "../util/mdx";

const Markdown = dynamic(() => import("../api-page/markdown/Markdown").then(({ Markdown }) => Markdown), {
    ssr: true,
});

export declare namespace ApiPageDescription {
    export interface Props {
        className?: string;
        description: string | SerializedMdxContent | undefined;
        isMarkdown: boolean;
    }
}

export const ApiPageDescription: React.FC<ApiPageDescription.Props> = ({ className, description }) => {
    if (description == null) {
        return null;
    }
    if (typeof description === "string") {
        return <section className={className}>{description}</section>;
    }
    return (
        <Markdown
            className={classNames(
                className,
                className?.includes("text-sm") ? "prose-sm dark:prose-invert-sm" : "prose dark:prose-invert",
            )}
            notProse
            mdx={description}
        />
    );
};
