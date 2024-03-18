import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { FernLinkCard } from "../components/FernCard";
import { MdxContent } from "../mdx/MdxContent";
import { ResolvedPath } from "../util/ResolvedPath";

export declare namespace BottomNavigationButton {
    export interface Props {
        neighbor: ResolvedPath.Neighbor;
        dir: "prev" | "next";
    }
}

export const BottomNavigationButton: React.FC<BottomNavigationButton.Props> = ({ neighbor, dir }) => {
    return (
        <FernLinkCard className="my-12 flex flex-1 items-center rounded-xl p-6" href={`/${neighbor.fullSlug}`}>
            {dir === "prev" && (
                <span className="sm:border-default t-muted sm-4 inline-flex items-center gap-2 py-2.5 text-sm sm:mr-6 sm:border-r sm:pr-6">
                    <ChevronLeftIcon />
                    <span className="hidden leading-none sm:inline">Go Back</span>
                </span>
            )}
            <div className="flex-1">
                <div className="text-base font-semibold">{neighbor.title}</div>

                {neighbor.excerpt && (
                    <div className="prose dark:prose-invert prose-sm prose-p:t-muted prose-p:m-0 prose-p:leading-snug mt-1 font-normal">
                        <MdxContent mdx={neighbor.excerpt} />
                    </div>
                )}
            </div>
            {dir === "next" && (
                <span className="sm:border-default t-muted sm-4 inline-flex items-center gap-2 py-2.5 text-sm sm:ml-6 sm:border-l sm:pl-6">
                    <span className="hidden leading-none sm:inline">Up Next</span>
                    <ChevronRightIcon />
                </span>
            )}
        </FernLinkCard>
    );
};
