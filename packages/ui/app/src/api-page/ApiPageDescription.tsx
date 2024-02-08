import classNames from "classnames";
import { Markdown } from "../api-page/markdown/Markdown";

export declare namespace ApiPageDescription {
    export interface Props {
        className?: string;
        description?: string;
        isMarkdown: boolean;
    }
}

export const ApiPageDescription: React.FC<ApiPageDescription.Props> = ({ className, isMarkdown, description }) => {
    if (description == null) {
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
