import classNames from "classnames";
import dynamic from "next/dynamic";

const Markdown = dynamic(() => import("../api-page/markdown/Markdown").then(({ Markdown }) => Markdown), {
    ssr: true,
});

export declare namespace ApiPageDescription {
    export interface Props {
        className?: string;
        description?: string;
        isMarkdown: boolean;
    }
}

export const ApiPageDescription: React.FC<ApiPageDescription.Props> = ({ className, isMarkdown, description }) => {
    if (description == null || description.trim().length === 0) {
        return null;
    }
    if (isMarkdown) {
        return (
            <Markdown
                className={classNames(
                    className,
                    className?.includes("text-sm") ? "prose-sm dark:prose-invert-sm" : "prose dark:prose-invert",
                )}
                notProse
            >
                {description}
            </Markdown>
        );
    }
    return <div className={className}>{description}</div>;
};
