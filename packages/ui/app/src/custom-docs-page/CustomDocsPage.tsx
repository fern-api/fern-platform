import { type ResolvedUrlPath } from "@fern-ui/app-utils";
import { useMemo } from "react";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { useDocsContext } from "../docs-context/useDocsContext";
import { MdxContent } from "../mdx/MdxContent";
import { TableOfContents } from "./TableOfContents";

export declare namespace CustomDocsPage {
    export interface Props {
        path: ResolvedUrlPath.MdxPage;
    }
}

export const CustomDocsPage: React.FC<CustomDocsPage.Props> = ({ path }) => {
    const { resolvePage, docsInfo } = useDocsContext();

    const page = useMemo(() => resolvePage(path.page.id), [path.page.id, resolvePage]);

    const sectionTitle = useMemo(() => {
        for (const navigationItem of docsInfo.activeNavigationConfig.items) {
            if (navigationItem.type !== "section") {
                continue;
            }
            const [sectionSlugInferredFromPath] = path.slug.split("/");
            if (sectionSlugInferredFromPath != null && navigationItem.urlSlug === sectionSlugInferredFromPath) {
                return navigationItem.title;
            }
        }
        return undefined;
    }, [docsInfo.activeNavigationConfig.items, path.slug]);

    const content = useMemo(() => {
        return <MdxContent mdx={path.serializedMdxContent} />;
    }, [path]);

    return (
        <div className="flex space-x-16 overflow-y-auto px-6 pt-8 md:px-12">
            <div className="max-w-3xl">
                {sectionTitle != null && (
                    <div className="text-accent-primary mb-4 text-xs font-semibold uppercase tracking-wider">
                        {sectionTitle}
                    </div>
                )}

                <div className="text-text-primary-light dark:text-text-primary-dark mb-8 text-3xl font-bold">
                    {path.page.title}
                </div>
                {content}
                <BottomNavigationButtons />
                <div className="h-20" />
            </div>
            <TableOfContents className="sticky top-0 hidden lg:flex" markdown={page.markdown} />
        </div>
    );
};
