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
        return <Markdown className={className}>{description}</Markdown>;
    }
    return <div className={className}>{description}</div>;
};
