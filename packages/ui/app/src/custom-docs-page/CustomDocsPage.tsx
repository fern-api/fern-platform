import { useMemo } from "react";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { useDocsContext } from "../docs-context/useDocsContext";
import { MdxContent } from "../mdx/MdxContent";
import { ResolvedUrlPath } from "../ResolvedUrlPath";
import { TableOfContents } from "./TableOfContents";

export declare namespace CustomDocsPage {
    export interface Props {
        path: ResolvedUrlPath.MdxPage;
    }
}

export const CustomDocsPage: React.FC<CustomDocsPage.Props> = ({ path }) => {
    const { resolvePage } = useDocsContext();

    const page = useMemo(() => resolvePage(path.page.id), [path.page.id, resolvePage]);

    const content = useMemo(() => {
        return <MdxContent mdx={path.serializedMdxContent} />;
    }, [path]);

    return (
        <div className="flex justify-center gap-20 overflow-y-auto px-[10vw] pt-[10vh]">
            <div className="w-[750px]">
                <div className="text-text-primary-light dark:text-text-primary-dark mb-8 text-3xl font-bold">
                    {path.page.title}
                </div>
                {content}
                <BottomNavigationButtons />
                <div className="h-20" />
            </div>
            <TableOfContents className="sticky top-0 hidden shrink-0 md:flex" markdown={page.markdown} />
        </div>
    );
};
