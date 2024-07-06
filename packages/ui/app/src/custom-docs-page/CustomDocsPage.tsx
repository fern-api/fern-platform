import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { MdxContent } from "../mdx/MdxContent";
import type { BundledMDX } from "../mdx/bundler";
import { type ResolvedPath } from "../resolver/ResolvedPath";

export declare namespace CustomDocsPage {
    export interface Props {
        serializedMdxContent: BundledMDX | undefined;
        resolvedPath: ResolvedPath.CustomMarkdownPage;
    }
}

export const CustomDocsPage: React.FC<CustomDocsPage.Props> = ({ resolvedPath }) => (
    <FernErrorBoundary component="CustomDocsPage">
        <MdxContent mdx={resolvedPath.serializedMdxContent} />
    </FernErrorBoundary>
);
