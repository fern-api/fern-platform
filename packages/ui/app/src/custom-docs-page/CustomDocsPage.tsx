import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { MdxContent } from "../mdx/MdxContent";
import { type SerializedMdxContent } from "../mdx/mdx";
import { type ResolvedPath } from "../resolver/ResolvedPath";

export declare namespace CustomDocsPage {
    export interface Props {
        serializedMdxContent: SerializedMdxContent | undefined;
        resolvedPath: ResolvedPath.CustomMarkdownPage;
    }
}

export const CustomDocsPage: React.FC<CustomDocsPage.Props> = ({ resolvedPath }) => (
    <FernErrorBoundary component="CustomDocsPage">
        <MdxContent mdx={resolvedPath.serializedMdxContent} />
    </FernErrorBoundary>
);
